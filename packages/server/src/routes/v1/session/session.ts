import { withPrefix } from "@/routes/utils";
import { requireMethod } from "@/middleware/methodChecker";
import { getAllSessionDetails } from "@/db/repository/session";
import { errorResponse } from "@/utils/errorResponse";
import { invalidJsonError, sessionNotFoundError, validationError } from "@/lib/errors";
import { sessionRequestDto } from "./session.dto";
import { buildSessionContext } from "@/service/session";
import { ensureSession } from "@/db/repository/message";

async function getAllSessions() {
    try {
        const sessions = await getAllSessionDetails();

        return new Response(JSON.stringify(sessions),{
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

async function getAllSessionMessages(request: Request) {
    try {
        let body: unknown;

        try {
            body = await request.json();
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
}

export const sessionRoutes = withPrefix("/session", {
    "/": requireMethod("GET", getAllSessions),
    "/messages": requireMethod("POST", getAllSessionMessages),
});
