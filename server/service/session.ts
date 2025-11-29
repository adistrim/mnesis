import { saveSession } from "@/db/repository/session";
import { genLLMResponse } from "@/lib/openai/openai";
import { LLMRequestType } from "@/lib/openai/openai.types";
import { genTitle } from "@/prompts";
import { isValidLLMResponse } from "@/utils/validateLLMResponse";

export async function createSession(userPrompt: string): Promise<string> {
    const config = {
        type: LLMRequestType.Chat,
        sysPrompt: genTitle,
        userPrompt,
    };

    const response = await genLLMResponse(config);

    const title = isValidLLMResponse(response)
        ? response.choices[0].message.content.trim()
        : "New session";

    const sessionId = await saveSession(title);
    return sessionId;
}
