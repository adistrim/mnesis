import { getSessionPreview, saveSession } from "@/db/repository/session";
import { genLLMResponse } from "@/lib/openai/openai";
import { LLMRequestType, ROLE } from "@/lib/openai/openai.type";
import { genTitle } from "@/prompts";
import { isValidLLMResponse } from "@/utils/validateLLMResponse";

export async function createSession(userPrompt: string): Promise<string> {
    const config = {
        type: LLMRequestType.Chat,
        sysPrompt: genTitle,
        userPrompt,
    };

    const response = await genLLMResponse(config);

    if (!isValidLLMResponse(response)) {
        console.warn("LLM failed to generate title, using fallback");
    }

    const title = isValidLLMResponse(response)
        ? response.choices[0].message.content.trim()
        : "New session";

    const sessionId = await saveSession(title);
    return sessionId;
}

export async function buildSessionContext(sessionId: string) {
    const preview = await getSessionPreview(sessionId);
    if (!preview || preview.length === 0) return [];

    const messages = [];

    for (const ex of preview) {
        const userContent = ex.user?.content ?? "";
        messages.push({
            role: ROLE.USER,
            content: userContent
        });

        if (ex.ai?.content) {
            messages.push({
                role: ROLE.ASSISTANT,
                content: ex.ai.content
            });
        }
    }

    return messages;
}
