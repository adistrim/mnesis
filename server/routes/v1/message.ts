import { db } from "@/db/db";
import { messages } from "@/db/schema";

export async function getMessageSchema() {
    const messageData = await db.select().from(messages).limit(10);

    return new Response(JSON.stringify(messageData.map(msg => ({
        id: msg.id,
        sessionId: msg.sessionId,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt
    }))), {
        headers: { "Content-Type": "application/json" },
    });
}
