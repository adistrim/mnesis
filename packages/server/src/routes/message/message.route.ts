import { getRecentAiMessages } from "@/db/repository/message";
import { Hono } from "hono";

export const messageRoute = new Hono();

messageRoute.get("/", async (ctx) => {
    const messages = await getRecentAiMessages(10);
    return ctx.json(messages);
});
