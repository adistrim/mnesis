import { deleteSession, getAllSessionDetails } from "@/db/repository/session";
import { invalidJsonError, sessionNotFoundError, validationError } from "@/lib/errors";
import { sessionRequestDto } from "./session.dto";
import { buildSessionContext } from "@/service/session";
import { ensureSession } from "@/db/repository/message";
import { Hono } from "hono";

export const sessionRoute = new Hono();

sessionRoute.get("/", async ctx => {
    const sessions = await getAllSessionDetails();
    return ctx.json(sessions);
});

sessionRoute.delete("/", async ctx => {
    const body = await ctx.req.json().catch(() => {
        throw invalidJsonError();
    });

    const parsed = sessionRequestDto.safeParse(body);

    if (!parsed.success) {
        throw validationError("Invalid request body", {
            error: parsed.error.issues,
        });
    }

    const sessionId = parsed.data.sessionId;

    await deleteSession(sessionId);

    return ctx.json({ success: true }, 200);
})

sessionRoute.post("/messages", async ctx => {
    const body = await ctx.req.json().catch(() => {
        throw invalidJsonError();
    });

    const parsed = sessionRequestDto.safeParse(body);

    if (!parsed.success) {
        throw validationError("Invalid request body", {
            error: parsed.error.issues,
        });
    }

    const sessionId = parsed.data.sessionId;

    const sessionExists = await ensureSession(sessionId);
    if (!sessionExists) {
        throw sessionNotFoundError(sessionId);
    }

    const messages = await buildSessionContext(sessionId);

    return ctx.json(messages);
});
