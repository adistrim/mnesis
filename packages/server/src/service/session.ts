import { getSessionPreview, saveSession } from "@/db/repository/session";
import { genLLMText } from "@/lib/openai/openai";
import { ROLE } from "@/lib/openai/openai.type";
import { getDefaultModel } from "@/lib/openai/models";
import { genTitle } from "@/prompts";

export async function createSession(userPrompt: string): Promise<string> {
    const config = {
        model: await getDefaultModel(),
        sysPrompt: genTitle,
        userPrompt,
    };

    const generated = (await genLLMText(config)).trim();

    if (!generated) {
        console.warn("LLM failed to generate title, using fallback");
    }

    const title = generated || "New session";

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

/**
 * Client-facing history. Separate from buildSessionContext because reasoning must never
 * be replayed to the model — DeepSeek rejects reasoning_content on request messages.
 */
export async function buildSessionHistory(sessionId: string) {
    const preview = await getSessionPreview(sessionId);
    if (!preview || preview.length === 0) return [];

    const messages = [];

    for (const ex of preview) {
        messages.push({
            role: ROLE.USER,
            content: ex.user?.content ?? "",
        });

        if (ex.ai?.content) {
            messages.push({
                role: ROLE.ASSISTANT,
                content: ex.ai.content,
                reasoning: ex.ai.reasoning ?? undefined,
            });
        }
    }

    return messages;
}
