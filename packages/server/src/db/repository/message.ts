import getDbClient from "@/db/client";
import type {
    RecentAiMessage,
    SaveAIMessageInput,
    SaveExchangeInput,
    SaveUserMessageInput,
} from "@/db/types";
import { databaseError, isAppError } from "@/lib/errors";

const db_client = getDbClient();

type DbExecutor = (
    strings: TemplateStringsArray,
    ...values: unknown[]
) => Promise<Array<Record<string, unknown>>>;

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
        if (isAppError(error)) throw error;
        throw databaseError("Failed to check session");
    }
}

/**
 * Persist a user message for a given session.
 */
export async function saveUserMessage(params: SaveUserMessageInput) {
    try {
        return await insertUserMessage(db_client as unknown as DbExecutor, params);
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in saveUserMessage:", error);
        throw databaseError("Failed to save user message");
    }
}

/**
 * Persist an AI message and optionally its reasoning.
 * Returns ids for aiMessage and reasoning (if saved).
 */
export async function saveAIMessageWithReasoning(params: SaveAIMessageInput) {
    try {
        return await insertAIMessageWithReasoning(
            db_client as unknown as DbExecutor,
            params,
        );
    } catch (error) {
        if (isAppError(error)) throw error;
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
export async function saveExchange(params: SaveExchangeInput) {
    try {
        return await db_client.begin(async (tx) => {
            const executor = tx as unknown as DbExecutor;

            const userMessageId = await insertUserMessage(executor, {
                sessionId: params.sessionId,
                content: params.user.content,
                tokens: params.user.tokens,
            });

            const { aiMessageId, reasoningId } =
                await insertAIMessageWithReasoning(executor, {
                    sessionId: params.sessionId,
                    model: params.ai.model,
                    content: params.ai.content,
                    responseTokens: params.ai.responseTokens,
                    reasoningTokens: params.ai.reasoningTokens,
                    reasoningContent: params.ai.reasoningContent,
                });

            return { userMessageId, aiMessageId, reasoningId };
        });
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in saveExchange:", error);
        throw databaseError("Failed to save conversation exchange");
    }
}

export async function getRecentAiMessages(limit = 10): Promise<RecentAiMessage[]> {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

    try {
        return (await db_client`
            SELECT
                id,
                session_id as "sessionId",
                model,
                tokens,
                reasoning,
                content,
                created_at::text as "createdAt"
            FROM ai_messages
            ORDER BY created_at DESC
            LIMIT ${safeLimit}
        `) as unknown as RecentAiMessage[];
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in getRecentAiMessages:", error);
        throw databaseError("Failed to get recent AI messages");
    }
}

async function insertUserMessage(
    db: DbExecutor,
    params: SaveUserMessageInput,
): Promise<number> {
    const rows = await db`
        INSERT INTO user_messages (session_id, content, tokens)
        VALUES (${params.sessionId}, ${params.content}, ${params.tokens})
        RETURNING id
    `;

    const row = rows[0] as { id?: number } | undefined;

    if (!row?.id) {
        throw databaseError("Failed to insert user message");
    }

    return row.id;
}

async function insertAIMessageWithReasoning(
    db: DbExecutor,
    params: SaveAIMessageInput,
): Promise<{ aiMessageId: number; reasoningId?: number }> {
    const reasoningPresent =
        Boolean(params.reasoningTokens && params.reasoningTokens > 0) &&
        Boolean(params.reasoningContent && params.reasoningContent.length > 0);

    const rows = await db`
        INSERT INTO ai_messages (session_id, model, tokens, reasoning, content)
        VALUES (
            ${params.sessionId},
            ${params.model},
            ${params.responseTokens},
            ${reasoningPresent},
            ${params.content}
        )
        RETURNING id
    `;

    const aiRow = rows[0] as { id?: number } | undefined;
    if (!aiRow?.id) {
        throw databaseError("Failed to insert AI message");
    }

    if (!reasoningPresent) {
        return { aiMessageId: aiRow.id };
    }

    const rRows = await db`
        INSERT INTO ai_message_reasonings (message_id, tokens, content)
        VALUES (
            ${aiRow.id},
            ${params.reasoningTokens},
            ${params.reasoningContent}
        )
        RETURNING id
    `;

    const rRow = rRows[0] as { id?: number } | undefined;
    if (!rRow?.id) {
        throw databaseError("Failed to insert AI reasoning");
    }

    return { aiMessageId: aiRow.id, reasoningId: rRow.id };
}
