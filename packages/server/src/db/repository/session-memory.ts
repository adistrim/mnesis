import getDbClient from "@/db/client";
import { databaseError, isAppError } from "@/lib/errors";

const db_client = getDbClient();

export type MemorySegment = {
    seq: number;
    fromUserMessageId: number;
    throughUserMessageId: number;
    content: string;
};

export async function getMemorySegments(
    sessionId: string,
): Promise<MemorySegment[]> {
    try {
        return (await db_client`
            SELECT seq,
                   from_user_message_id AS "fromUserMessageId",
                   through_user_message_id AS "throughUserMessageId",
                   content
            FROM session_memory
            WHERE session_id = ${sessionId}::uuid
            ORDER BY seq
        `) as unknown as MemorySegment[];
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in getMemorySegments:", error);
        throw databaseError("Failed to read session memory");
    }
}

/**
 * Appends a segment. The (session_id, seq) primary key is the concurrency guard: two
 * compactions racing on one session compute the same next seq, so the loser conflicts and
 * writes nothing rather than clobbering the winner or regressing the watermark.
 * Returns whether this call was the one that wrote.
 */
export async function appendMemorySegment(params: {
    sessionId: string;
    seq: number;
    fromUserMessageId: number;
    throughUserMessageId: number;
    content: string;
    model: string;
}): Promise<boolean> {
    try {
        const rows = await db_client`
            INSERT INTO session_memory
                (session_id, seq, from_user_message_id, through_user_message_id, content, model)
            VALUES (
                ${params.sessionId}::uuid,
                ${params.seq},
                ${params.fromUserMessageId},
                ${params.throughUserMessageId},
                ${params.content},
                ${params.model}
            )
            ON CONFLICT (session_id, seq) DO NOTHING
            RETURNING seq
        `;
        return rows.length > 0;
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Database error in appendMemorySegment:", error);
        throw databaseError("Failed to write session memory");
    }
}
