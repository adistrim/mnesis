import db_client from "@/db/client";
import { AppError, databaseError, sessionNotFoundError } from "@/lib/errors";

export async function ensureSession(sessionId: string): Promise<boolean> {
    try {
        if (!sessionId) return false;

        const rows = await db_client`
            SELECT id
            FROM sessions
            WHERE id = ${sessionId}
            LIMIT 1
        `;

        return rows.length > 0;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw sessionNotFoundError(sessionId);
    }
}

/**
 * Persist a user message for a given session.
 */
export async function saveUserMessage(params: {
    sessionId: string;
    content: string;
    tokens: number;
}) {
    try {
        const { sessionId, content, tokens } = params;

        const rows = await db_client`
            INSERT INTO user_messages (session_id, content, tokens)
            VALUES (${sessionId}, ${content}, ${tokens})
            RETURNING id
        `;

        const row = rows[0];

        if (!row) {
            throw databaseError("Failed to insert user message");
        }

        return row.id;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Database error in saveUserMessage:", error);
        throw databaseError("Failed to save user message");
    }
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
    try {
        const reasoningPresent =
            params.reasoningTokens &&
            params.reasoningTokens > 0 &&
            params.reasoningContent &&
            params.reasoningContent.length > 0;

        const rows = await db_client`
            INSERT INTO ai_messages (session_id, model, tokens, reasoning, content)
            VALUES (
                ${params.sessionId},
                ${params.model},
                ${params.responseTokens},
                ${Boolean(reasoningPresent)},
                ${params.content}
            )
            RETURNING id
        `;

        const aiRow = rows[0];

        if (!aiRow) {
            throw databaseError("Failed to insert AI message");
        }

        let reasoningId;

        if (reasoningPresent) {
            const rRows = await db_client`
                INSERT INTO ai_message_reasonings (message_id, tokens, content)
                VALUES (
                    ${aiRow.id},
                    ${params.reasoningTokens},
                    ${params.reasoningContent}
                )
                RETURNING id
            `;

            const rRow = rRows[0];

            if (!rRow) {
                throw databaseError("Failed to insert AI reasoning");
            }
            reasoningId = rRow.id;
        }

        return { aiMessageId: aiRow.id, reasoningId };
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Database error in saveAIMessageWithReasoning:", error);
        throw databaseError("Failed to save AI message");
    }
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
