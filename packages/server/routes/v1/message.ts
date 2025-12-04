import { db } from "@/db/client";
import { aiMessages } from "@/db/schema";
import { withPrefix } from "../utils";
import { requireMethod } from "@/middleware/methodChecker";

async function getMessages() {
    const messageData = await db.select().from(aiMessages).limit(10);

    return new Response(
        JSON.stringify(
            messageData.map((msg) => ({
                id: msg.id,
                sessionId: msg.sessionId,
                model: msg.model,
                tokens: msg.tokens,
                reasoning: msg.reasoning,
                content: msg.content,
                createdAt: msg.createdAt,
            })),
        ),
        {
            headers: { "Content-Type": "application/json" },
        },
    );
}

export const messageRoutes = withPrefix("/message", {
    "/": requireMethod("GET", getMessages),
});
