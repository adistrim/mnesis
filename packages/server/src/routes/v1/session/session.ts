import { deleteSession, getAllSessionDetails } from "@/db/repository/session";
import { errorResponse } from "@/utils/errorResponse";
import { invalidJsonError, sessionNotFoundError, validationError } from "@/lib/errors";
import { sessionRequestDto } from "./session.dto";
import { buildSessionContext } from "@/service/session";
import { ensureSession } from "@/db/repository/message";
import { Hono } from "hono";

export const sessionRoute = new Hono();

sessionRoute.get("/", async () => {
    try {
        const sessions = await getAllSessionDetails();

        return new Response(JSON.stringify(sessions), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
});

sessionRoute.delete("/", async ctx => {
    try {
        let body: unknown;

        try {
            body = await ctx.req.json();
        } catch {
            throw invalidJsonError();
        }

        const parsed = sessionRequestDto.safeParse(body);

        if (!parsed.success) {
            throw validationError("Invalid request body", {
                error: parsed.error.issues,
            });
        }

        const sessionId = parsed.data.sessionId;

        await deleteSession(sessionId);

        return ctx.json({ success: true }, 200);
    } catch (error) {
        return errorResponse(error);
    }
})

sessionRoute.post("/messages", async ctx => {
    try {
        let body: unknown;

        try {
            body = await ctx.req.json();
        } catch {
            throw invalidJsonError();
        }

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

        return new Response(JSON.stringify(messages), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
});
