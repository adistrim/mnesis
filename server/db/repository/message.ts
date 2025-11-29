import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
    aiMessageReasoning,
    aiMessages,
    sessions,
    userMessages,
    type AiMessageInsert,
    type AiMessageReasoningInsert,
    type UserMessageInsert,
} from "@/db/schema";

export async function ensureSession(sessionId: string): Promise<boolean> {
    if (sessionId) {
        const existing = await db
            .select({ id: sessions.id })
            .from(sessions)
            .where(eq(sessions.id, sessionId));
        if (existing.length > 0) return true;
    }

    return false;
}

/**
 * Persist a user message for a given session.
 */
export async function saveUserMessage(params: {
    sessionId: string;
    content: string;
    tokens: number;
}) {
    const insert: UserMessageInsert = {
        sessionId: params.sessionId,
        content: params.content,
        tokens: params.tokens,
    };
    const [row] = await db
        .insert(userMessages)
        .values(insert)
        .returning({ id: userMessages.id });

    if (!row) {
        throw new Error(
            `(Save User Message) Database Insert error - ${userMessages} table`,
        );
    }
    return row.id;
}

/**
 * Persist an AI message and optionally its reasoning.
 * Returns ids for aiMessage and reasoning (if saved).
 */
export async function saveAIMessageWithReasoning(params: {
    sessionId: string;
    model: string;
    content: string;
    responseTokens: number;
    reasoningTokens?: number;
    reasoningContent?: string | null;
}) {
    const reasoningPresent =
        params.reasoningTokens &&
        params.reasoningTokens > 0 &&
        params.reasoningContent &&
        params.reasoningContent.length > 0;

    const aiInsert: AiMessageInsert = {
        sessionId: params.sessionId,
        model: params.model,
        tokens: params.responseTokens,
        reasoning: Boolean(reasoningPresent),
        content: params.content,
    };

    const [aiRow] = await db
        .insert(aiMessages)
        .values(aiInsert)
        .returning({ id: aiMessages.id });

    if (!aiRow) {
        throw new Error(
            `(Save AI Message with Reasoning) Database Insert error - ${aiMessages} table`,
        );
    }

    let reasoningId: number | undefined;

    if (reasoningPresent) {
        const reasoningInsert: AiMessageReasoningInsert = {
            messageId: aiRow.id,
            tokens: params.reasoningTokens!,
            content: params.reasoningContent!,
        };
        const [rRow] = await db
            .insert(aiMessageReasoning)
            .values(reasoningInsert)
            .returning({ id: aiMessageReasoning.id });

        if (!rRow) {
            throw new Error(
                `(Save AI Message with Reasoning) Database Insert error - ${aiMessageReasoning} table`,
            );
        }
        reasoningId = rRow.id;
    }

    return { aiMessageId: aiRow.id, reasoningId };
}

/**
 * Convenience function to persist both sides of the exchange.
 * Use the token accounting from the LLM usage.
 *
 * Returns ids for userMessage, aiMessage, and reasoning (if saved).
 */
export async function saveExchange(params: {
    sessionId: string;
    user: { content: string; tokens: number };
    ai: {
        model: string;
        content: string;
        responseTokens: number;
        reasoningTokens?: number;
        reasoningContent?: string | null;
    };
}) {
    // Save user message
    const userMessageId = await saveUserMessage({
        sessionId: params.sessionId,
        content: params.user.content,
        tokens: params.user.tokens,
    });

    // Save AI message (+ reasoning if present)
    const { aiMessageId, reasoningId } = await saveAIMessageWithReasoning({
        sessionId: params.sessionId,
        model: params.ai.model,
        content: params.ai.content,
        responseTokens: params.ai.responseTokens,
        reasoningTokens: params.ai.reasoningTokens,
        reasoningContent: params.ai.reasoningContent,
    });

    return { userMessageId, aiMessageId, reasoningId };
}
