import { Hono } from "hono";
import { listModels } from "@/lib/openai/models";

export const modelRoute = new Hono();

modelRoute.get("/", async (ctx) => {
    return ctx.json(await listModels());
});
