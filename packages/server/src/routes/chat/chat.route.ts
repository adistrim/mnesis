import { getResponse } from "@/service/chat";
import { getDefaultModel, isKnownModel } from "@/lib/openai/models";
import { createSession } from "@/service/session";
import { invalidJsonError, validationError } from "@/lib/errors";
import { chatRequestDto } from "./chat.dto";
import { Hono } from "hono";

export const chatRoute = new Hono();

chatRoute.post("/", async (ctx) => {
    const body = await ctx.req.json().catch(() => {
        throw invalidJsonError();
    });

    const parsed = chatRequestDto.safeParse(body);

    if (!parsed.success) {
        throw validationError("Invalid request body", {
            error: parsed.error.issues,
        });
    }

    const { prompt, model, sessionId: providedSessionId } = parsed.data;

    if (model && !(await isKnownModel(model))) {
        throw validationError("Unknown model", { model });
    }

    const selectedModel = model ?? (await getDefaultModel());
    const sessionId = providedSessionId ?? (await createSession(prompt));
    const response = await getResponse(sessionId, prompt, selectedModel);

    return ctx.json({ response });
});
