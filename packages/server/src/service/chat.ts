import { streamLLMResponse } from "@/lib/openai/openai";
import { sysPrompt } from "@/prompts";
import { ensureSession, saveExchange } from "@/db/repository/message";
import { isAppError, sessionNotFoundError } from "@/lib/errors";
import { buildSessionContext } from "./session";
import { getToolDefinitions } from "@/tools";
import { citedSources } from "@/tools/sources";
import { createAccumulator, type StreamEvent } from "@/lib/openai/stream.type";

/**
 * Streams a chat turn and persists the exchange once it settles — including when the
 * client aborts, which resumes this generator at the yield and runs the `finally`.
 */
export async function* streamResponse(
    sessionId: string,
    userPrompt: string,
    model: string,
    signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
    const sessionExists = await ensureSession(sessionId);
    if (!sessionExists) {
        throw sessionNotFoundError(sessionId);
    }

    const sessionContext = await buildSessionContext(sessionId);
    const tools = getToolDefinitions();
    const acc = createAccumulator(model);

    let finalized = false;

    const finalize = async () => {
        // Abort and normal completion can both reach here; saveExchange has no
        // idempotency key, so the guard is what prevents a duplicate row.
        if (finalized) return;
        finalized = true;

        // ai_messages.content is NOT NULL, and an aborted turn very often stops during
        // the reasoning phase. A blank row would also surface as a phantom exchange in
        // buildSessionContext, so drop it entirely instead.
        if (!acc.content.trim()) {
            console.warn("Skipping persistence: no content generated", { sessionId });
            return;
        }

        const promptTokens = Math.max(acc.usage.promptTokens - sysPrompt.tokens, 0);
        const responseTokens = Math.max(
            acc.usage.completionTokens - acc.usage.reasoningTokens,
            0,
        );

        try {
            await saveExchange({
                sessionId,
                user: { content: userPrompt, tokens: promptTokens },
                ai: {
                    model: acc.model,
                    content: acc.content,
                    responseTokens,
                    reasoningTokens: acc.usage.reasoningTokens,
                    reasoningContent: acc.reasoning || null,
                    citations: citedSources(acc.content, acc.sources),
                },
            });
        } catch (error) {
            if (isAppError(error)) throw error;
            console.error("Error saving conversation exchange:", error);
        }
    };

    try {
        yield* streamLLMResponse(
            { model, sysPrompt, userPrompt, sessionContext, tools },
            acc,
            signal,
        );
    } finally {
        await finalize();
    }
}
