import { AppError, databaseError } from "@/lib/errors";
import { db } from "../client";
import { aiMessages, sessions, userMessages } from "../schema";
import { eq, sql } from "drizzle-orm";
import { ROLE } from "@/lib/openai/openai.type";

export async function saveSession(title: string) {
    try {
        const [session] = await db
            .insert(sessions)
            .values({ title })
            .returning({ id: sessions.id });

        if (!session) {
            throw databaseError("Failed to create session");
        }
        return session.id;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Database error in saveSession:", error);
        throw databaseError("Failed to create session");
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
type Exchange = {
    user: { id: number; content: string };
    ai?: { id: number; content: string };
};
export async function getSessionPreview(sessionId: string) {
    const rows = await db
        .select({
            id: userMessages.id,
            content: userMessages.content,
            createdAt: userMessages.createdAt,
            role: sql`${ROLE.USER}`.as("role")
        })
        .from(userMessages)
        .where(eq(userMessages.sessionId, sessionId))
        .unionAll(
            db.select({
                id: aiMessages.id,
                content: aiMessages.content,
                createdAt: aiMessages.createdAt,
                role: sql`${ROLE.ASSISTANT}`.as("role")
            })
            .from(aiMessages)
            .where(eq(aiMessages.sessionId, sessionId))
        )
        .orderBy(sql`created_at`);

    const exchanges: Exchange[] = [];
    let last: Exchange | null = null;

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
}
