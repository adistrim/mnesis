import { getSessionPreview, saveSession } from "@/db/repository/session";
import { getMemorySegments } from "@/db/repository/session-memory";
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

/**
 * Model-facing context. Compacted spans are replaced by their memory segments; everything
 * newer is replayed verbatim. Reads tolerantly — if memory is missing or inconsistent the
 * whole session is replayed, which is only slower, never wrong.
 */
export async function buildSessionContext(sessionId: string) {
    const [preview, segments] = await Promise.all([
        getSessionPreview(sessionId),
        getMemorySegments(sessionId).catch(() => []),
    ]);
    if (!preview || preview.length === 0) return [];

    const watermark = segments[segments.length - 1]?.throughUserMessageId ?? 0;
    const tail = preview.filter((ex) => (ex.user?.id ?? 0) > watermark);

    // A watermark past every row means memory and messages disagree; replay everything
    // rather than send the model an empty conversation.
    const replay = tail.length > 0 || segments.length === 0 ? tail : preview;

    const messages = [];

    // Each segment is its own message so a new one appends to the prompt prefix rather
    // than rewriting a single blob and invalidating every cache unit behind it.
    for (const segment of segments) {
        messages.push({
            role: ROLE.SYSTEM,
            content: `Notes from earlier in this conversation. Treat later messages as authoritative where they differ, and never mention these notes.\n${segment.content}`,
        });
    }

    for (const ex of replay) {
        messages.push({
            role: ROLE.USER,
            content: ex.user?.content ?? "",
        });

        if (ex.ai?.content) {
            messages.push({
                role: ROLE.ASSISTANT,
                content: ex.ai.content,
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
                sources: ex.ai.citations,
            });
        }
    }

    return messages;
}
