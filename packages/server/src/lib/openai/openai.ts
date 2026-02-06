import { settings } from "@/config/settings";
import OpenAI from "openai";
import {
    MODEL,
    ROLE,
    LLMRequestType,
    type GenLLMResponseParams,
} from "./openai.type";
import type {
    ChatCompletion,
    ChatCompletionMessageParam,
} from "openai/resources";
import { llmServiceError, validationError } from "@/lib/errors";
import { isAppError } from "@/lib/errors/appError";
import { executeTools, type ToolCall } from "@/tools";

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
export const MAX_TOOL_ITERATIONS = 5;

const openai = new OpenAI({
    baseURL: settings.LLM_HOST,
    apiKey: settings.LLM_HOST_API,
});

export async function genLLMResponse(
    params: GenLLMResponseParams,
): Promise<ChatCompletion> {
    const { type, sysPrompt, userPrompt, sessionContext, tools } = params;

    const hasTools = Array.isArray(tools) && tools.length > 0;

    let model;
    if (type === LLMRequestType.Chat) {
        model = MODEL.CHAT;
    } else if (type === LLMRequestType.Reasoning) {
        model = MODEL.REASONING;
    } else {
        throw validationError("Invalid request type", { type });
    }

    const messages: ChatCompletionMessageParam[] = [
        { role: ROLE.SYSTEM, content: sysPrompt.content },
        ...(sessionContext ?? []),
        { role: ROLE.USER, content: userPrompt },
    ];

    try {
        let completion = await openai.chat.completions.create({
            model,
            messages,
            temperature: TEMPERATURE,
            ...(hasTools && { tools }),
        });

        let iterations = 0;

        while (
            hasTools &&
            completion.choices[0]?.message?.tool_calls?.length &&
            iterations < MAX_TOOL_ITERATIONS
        ) {
            const toolCalls = completion.choices[0].message
                .tool_calls as ToolCall[];

            messages.push(completion.choices[0].message);

            const toolResults = await executeTools(toolCalls);

            for (const result of toolResults) {
                messages.push(result);
            }

            completion = await openai.chat.completions.create({
                model,
                messages,
                temperature: TEMPERATURE,
                tools,
            });

            iterations++;
        }

        return completion;
    } catch (error) {
        if (isAppError(error)) {
            throw error;
        }

        console.error("LLM response generation failed", error);
        throw llmServiceError();
    }
}
