import { ROLE, type GenLLMResponseParams } from "./openai.type";
import type {
    ChatCompletionMessageParam,
    ChatCompletionMessageToolCall,
} from "openai/resources";
import { isAppError, llmServiceError } from "@/lib/errors";
import { executeTools } from "@/tools";
import { type ToolCall } from "@/types/tools.type";
import { MAX_TOOL_ITERATIONS } from "./constants";
import { openai } from "./client";
import {
    createAccumulator,
    type StreamAccumulator,
    type StreamEvent,
} from "./stream.type";

/*
    source: https://api-docs.deepseek.com/quick_start/parameter_settings
    date: 29/11/2025 (DD/MM/YYYY)
    The Temperature Parameter:
        Coding / Math = 0.0
        Data Cleaning / Data Analysis = 1.0
        General Conversation = 1.3
        Translation = 1.3
        Creative Writing / Poetry = 1.5
*/

const TEMPERATURE = 1.3;

type ToolCallSlot = { id: string; name: string; arguments: string };

type ToolCallDelta = {
    index: number;
    id?: string;
    function?: { name?: string; arguments?: string };
};

type StreamDelta = {
    content?: string;
    reasoning_content?: string;
    tool_calls?: ToolCallDelta[];
};

/**
 * Fragments are merged by `index` — it is the only field present on continuation
 * chunks, and parallel calls interleave. Only `arguments` accumulates; `id` and
 * `name` are assigned.
 */
function accumulateToolCalls(
    slots: Map<number, ToolCallSlot>,
    deltas: ToolCallDelta[],
): void {
    for (const delta of deltas) {
        const slot = slots.get(delta.index) ?? { id: "", name: "", arguments: "" };
        if (delta.id) slot.id = delta.id;
        if (delta.function?.name) slot.name = delta.function.name;
        if (delta.function?.arguments) slot.arguments += delta.function.arguments;
        slots.set(delta.index, slot);
    }
}

/**
 * A slot missing an id or name cannot be answered with a matching `tool` message, and
 * DeepSeek rejects the next request if one is left unpaired — so it is dropped from the
 * assistant message and the execution set together.
 */
function toToolCalls(slots: Map<number, ToolCallSlot>): ToolCall[] {
    return [...slots.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, slot]) => slot)
        .filter((slot) => slot.id && slot.name)
        .map((slot) => ({
            id: slot.id,
            function: {
                name: slot.name,
                // "" is a legal zero-arg call but JSON.parse would throw on it
                arguments: slot.arguments || "{}",
            },
        }));
}

/**
 * Streams one chat turn, running the tool loop inline. Reasoning and content from every
 * iteration are streamed — DeepSeek emits reasoning on each one. `acc` is mutated as the
 * turn progresses so the caller can persist partial output after an abort.
 */
export async function* streamLLMResponse(
    params: GenLLMResponseParams,
    acc: StreamAccumulator,
    signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
    const { model, sysPrompt, userPrompt, sessionContext, tools } = params;
    const hasTools = Array.isArray(tools) && tools.length > 0;

    const messages: ChatCompletionMessageParam[] = [
        { role: ROLE.SYSTEM, content: sysPrompt.content },
        ...(sessionContext ?? []),
        { role: ROLE.USER, content: userPrompt },
    ];

    try {
        for (let iteration = 0; iteration <= MAX_TOOL_ITERATIONS; iteration++) {
            // On the last permitted leg tools are withheld, so the turn ends with a real
            // answer instead of an exhausted loop and an empty message.
            const offerTools = hasTools && iteration < MAX_TOOL_ITERATIONS;

            const stream = await openai.chat.completions.create(
                {
                    model,
                    messages,
                    temperature: TEMPERATURE,
                    stream: true,
                    stream_options: { include_usage: true },
                    ...(offerTools && { tools }),
                },
                { signal },
            );

            const slots = new Map<number, ToolCallSlot>();
            let legContent = "";
            let finishReason: string | null = null;

            for await (const chunk of stream) {
                const choice = chunk.choices[0];
                const delta = choice?.delta as StreamDelta | undefined;

                if (delta?.reasoning_content) {
                    acc.reasoning += delta.reasoning_content;
                    yield { type: "reasoning", delta: delta.reasoning_content };
                }

                if (delta?.content) {
                    acc.content += delta.content;
                    legContent += delta.content;
                    yield { type: "content", delta: delta.content };
                }

                if (delta?.tool_calls) {
                    accumulateToolCalls(slots, delta.tool_calls);
                }

                if (choice?.finish_reason) finishReason = choice.finish_reason;

                // The usage chunk arrives with an empty choices array.
                if (chunk.usage) {
                    // prompt_tokens re-counts the whole growing message array each leg,
                    // so only the first is kept; generated tokens are disjoint and summed.
                    if (acc.usage.promptTokens === 0) {
                        acc.usage.promptTokens = chunk.usage.prompt_tokens ?? 0;
                    }
                    acc.usage.completionTokens += chunk.usage.completion_tokens ?? 0;
                    acc.usage.reasoningTokens +=
                        chunk.usage.completion_tokens_details?.reasoning_tokens ?? 0;
                }
            }

            if (finishReason !== "tool_calls") break;

            const toolCalls = toToolCalls(slots);
            if (toolCalls.length === 0) break;

            messages.push({
                role: ROLE.ASSISTANT,
                // null, not "" — and never reasoning_content, which DeepSeek rejects
                // on request messages.
                content: legContent || null,
                tool_calls: toolCalls.map((call) => ({
                    ...call,
                    type: "function",
                })) as unknown as ChatCompletionMessageToolCall[],
            });

            for (const call of toolCalls) {
                yield { type: "tool", name: call.function.name, status: "start" };
            }

            const toolResults = await executeTools(toolCalls);

            for (const call of toolCalls) {
                yield { type: "tool", name: call.function.name, status: "done" };
            }

            for (const result of toolResults) {
                messages.push(result);
            }
        }
    } catch (error) {
        if (signal?.aborted) return;
        if (isAppError(error)) throw error;
        console.error("LLM stream failed", error);
        throw llmServiceError();
    }
}

/** Drains a turn to its text — for turns that have no use for deltas. */
export async function genLLMText(params: GenLLMResponseParams): Promise<string> {
    const acc = createAccumulator(params.model);
    for await (const _event of streamLLMResponse(params, acc)) {
        // deltas are already accumulated into `acc`
    }
    return acc.content;
}
