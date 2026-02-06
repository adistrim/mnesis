import { databaseError, isAppError, sessionNotFoundError } from "@/lib/errors";
import getDbClient from "@/db/client";
import { ROLE } from "@/lib/openai/openai.type";
import type { SessionExchange, SessionHistoryRow, SessionSummary } from "@/db/types";

const db_client = getDbClient();

export async function saveSession(title: string) {
    try {
        const rows = await db_client`
            INSERT INTO sessions (title)
            VALUES (${title})
            RETURNING id
        `;
        const session = rows[0];
        if (!session) {
            throw databaseError("Failed to create session");
        }
        return session.id;
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in saveSession:", error);
        throw databaseError("Failed to create session");
    }
}

export async function deleteSession(sessionId: string) {
    try {
        const result = await db_client`
            DELETE FROM sessions
            WHERE id = ${sessionId}
            RETURNING id
        `;

        if (result.length === 0) {
            throw sessionNotFoundError(sessionId);
        }
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in deleteSession:", error);
        throw databaseError("Failed to delete session");
    }
}

/**
 * Get a preview of recent exchanges for a session.
 *
 * Returns an array of exchanges ordered from oldest -> newest.
 * Each exchange has the shape:
 *   { user: { id, content }, ai?: { id, content } }
 *
 * If an AI reply for a user message is missing, the `ai` field will be undefined.
 */
export async function getSessionPreview(sessionId: string) {
    try {
        const rows = (await db_client`
            (
                SELECT id, content, created_at::text as "createdAt", ${ROLE.USER} as role
                FROM user_messages
                WHERE session_id = ${sessionId}::uuid
            )
            UNION ALL
            (
                SELECT id, content, created_at::text as "createdAt", ${ROLE.ASSISTANT} as role
                FROM ai_messages
                WHERE session_id = ${sessionId}::uuid
            )
            ORDER BY "createdAt"
        `) as unknown as SessionHistoryRow[];

        const exchanges: SessionExchange[] = [];
        let last: SessionExchange | null = null;

        for (const r of rows) {
            if (r.role === "user") {
                last = { user: { id: r.id, content: r.content }, ai: undefined };
                exchanges.push(last);
            } else {
                if (last && !last.ai) {
                    last.ai = { id: r.id, content: r.content };
                }
            }
        }

        return exchanges;
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in getSessionPreview:", error);
        throw databaseError("Failed to get session preview");
    }
}

export async function getAllSessionDetails() {
    try {
        return (await db_client`
            SELECT
                id,
                title,
                created_at::text as "createdAt"
            FROM sessions
            ORDER BY created_at DESC
        `) as unknown as SessionSummary[];
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in getAllSessions:", error);
        throw databaseError("Failed to get all sessions");
    }
}
