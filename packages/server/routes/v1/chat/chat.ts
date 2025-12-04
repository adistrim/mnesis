import { getResponse } from "@/service/chat";
import { withPrefix } from "@/routes/utils";
import { requireMethod } from "@/middleware/methodChecker";
import { LLMRequestType } from "@/lib/openai/openai.type";
import { createSession } from "@/service/session";
import { invalidJsonError, validationError } from "@/lib/errors";
import { errorResponse } from "@/utils/errorResponse";
import { chatRequestDto } from "./chat.dto";

async function chat(request: Request) {
    try {
        let body: unknown;

        try {
            body = await request.json();
        } catch {
            throw invalidJsonError();
        }

        const parsed = chatRequestDto.safeParse(body);

        if (!parsed.success) {
            throw validationError("Invalid request body", {
                error: parsed.error.issues,
            });
        }

        const { prompt, type, sessionId: providedSessionId } = parsed.data;

        const requestType = type ?? LLMRequestType.Chat;
        const sessionId = providedSessionId ?? (await createSession(prompt));
        const response = await getResponse(sessionId, prompt, requestType);

        return new Response(JSON.stringify({ response }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export const chatRoutes = withPrefix("/chat", {
    "/": requireMethod("POST", chat),
});
