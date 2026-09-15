import { streamResponse } from "@/service/chat";
import { getDefaultModel, isKnownModel } from "@/lib/openai/models";
import { createSession } from "@/service/session";
import { invalidJsonError, isAppError, validationError } from "@/lib/errors";
import { chatRequestDto } from "./chat.dto";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

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

    // Everything above can still fail as a clean JSON 4xx; once the stream opens,
    // failures have to travel as `error` events instead.
    const selectedModel = model ?? (await getDefaultModel());
    const sessionId = providedSessionId ?? (await createSession(prompt));

    return streamSSE(ctx, async (stream) => {
        const controller = new AbortController();
        stream.onAbort(() => controller.abort());

        await stream.writeSSE({
            event: "session",
            data: JSON.stringify({ sessionId }),
        });

        try {
            for await (const event of streamResponse(
                sessionId,
                prompt,
                selectedModel,
                controller.signal,
            )) {
                const { type, ...payload } = event;
                await stream.writeSSE({
                    event: type,
                    data: JSON.stringify(payload),
                });
            }

            await stream.writeSSE({
                event: "done",
                data: JSON.stringify({ model: selectedModel }),
            });
        } catch (error) {
            if (controller.signal.aborted) return;

            console.error("Chat stream failed", error);
            const appError = isAppError(error) ? error : null;
            await stream.writeSSE({
                event: "error",
                data: JSON.stringify({
                    code: appError?.code ?? "INTERNAL_ERROR",
                    message: appError?.message ?? "Something went wrong",
                }),
            });
        }
    });
});
