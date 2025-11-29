import { genLLMResponse } from "@/lib/openai/openai";
import { sysPrompt } from "@/prompts";
import {
    LLMRequestType,
    type CustomResponseType,
} from "@/lib/openai/openai.types";
import { isValidLLMResponse } from "@/utils/validateLLMResponse";
import { saveExchange } from "@/db/repository/message";

export async function getResponse(
    sessionId: string,
    userPrompt: string,
    requestType: LLMRequestType,
) {
    const completion = await genLLMResponse({
        type: requestType,
        sysPrompt: sysPrompt,
        userPrompt,
    });

    const ok = isValidLLMResponse(completion);

    // fallback
    if (!ok) {
        return {
            sessionId,
            message: "Error during response generation.",
        };
    }

    const customMsg = completion.choices[0].message as CustomResponseType;

    const usage = completion.usage;
    const prompt_tokens = Math.max(
        (usage?.prompt_tokens ?? 0) - sysPrompt.tokens,
        0,
    );
    const completion_tokens = usage?.completion_tokens ?? 0;
    const reasoning_tokens =
        usage?.completion_tokens_details?.reasoning_tokens ?? 0;
    const response_tokens = Math.max(completion_tokens - reasoning_tokens, 0);
    const message = customMsg.content;
    const reasoning = customMsg.reasoning_content;
    const model = completion.model;

    await saveExchange({
        sessionId: sessionId,
        user: {
            content: userPrompt,
            tokens: prompt_tokens,
        },
        ai: {
            model,
            content: message,
            responseTokens: response_tokens,
            reasoningTokens: reasoning_tokens ?? 0,
            reasoningContent: reasoning ?? null,
        },
    });

    const response = {
        sessionId,
        message,
    };

    return response;
}
