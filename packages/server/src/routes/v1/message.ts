import db_client from "@/db/client";
import { Hono } from "hono";

export const messageRoute = new Hono();

type AiMessageRow = {
    id: number;
    session_id: string;
    model: string;
    tokens: number;
    reasoning: boolean;
    content: string;
    created_at: string;
};

messageRoute.get("/", async () => {
    const rows = await db_client`
        SELECT id, session_id, model, tokens, reasoning, content, created_at
        FROM ai_messages
        LIMIT 10
    `;

    const messageData = (rows as AiMessageRow[]).map((r: AiMessageRow) => ({
        id: r.id,
        sessionId: r.session_id,
        model: r.model,
        tokens: r.tokens,
        reasoning: r.reasoning,
        content: r.content,
        createdAt: r.created_at
    }));

    return new Response(JSON.stringify(messageData), {
        headers: { "Content-Type": "application/json" }
    });
});
