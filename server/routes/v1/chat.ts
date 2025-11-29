import { getResponse } from "@/service/chat";
import { withPrefix } from "@/routes/utils";
import { requireMethod } from "@/middleware/methodChecker";
import { LLMRequestType } from "@/lib/openai/openai.types";
import { createSession } from "@/service/session";

interface requestBody {
    prompt: string;
    type?: LLMRequestType;
    sessionId?: string;
}

async function chat(request: Request) {
    let body: requestBody;

    // safe json parsing
    try {
        body = (await request.json()) as requestBody;
    } catch (e) {
        return new Response(
            JSON.stringify({ error: "Invalid or unparseable JSON body." }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    let requestType;
    if (!body.type) {
        requestType = LLMRequestType.Chat;
    } else {
        requestType = body.type;
    }

    // validation!
    const userPrompt = body.prompt;
    if (!userPrompt) {
        return new Response(
            JSON.stringify({ error: "Missing 'userPrompt' in request body." }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    // real stuff
    const sessionId = body.sessionId ?? (await createSession(userPrompt));

    return new Response(
        JSON.stringify({
            response: await getResponse(sessionId, userPrompt, requestType),
        }),
        {
            headers: { "Content-Type": "application/json" },
        },
    );
}

export const chatRoutes = withPrefix("/chat", {
    "/": requireMethod("POST", chat),
});
