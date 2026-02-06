import { genLLMResponse } from "@/lib/openai/openai";
import { sysPrompt } from "@/prompts";
import {
    LLMRequestType,
    type CustomResponseType,
} from "@/lib/openai/openai.type";
import { isValidLLMResponse } from "@/utils/validateLLMResponse";
import { ensureSession, saveExchange } from "@/db/repository/message";
import {
    databaseError,
    isAppError,
    invalidLLMResponseError,
    sessionNotFoundError,
} from "@/lib/errors";
import { buildSessionContext } from "./session";
import { getToolDefinitions } from "@/tools";

export async function getResponse(
    sessionId: string,
    userPrompt: string,
    requestType: LLMRequestType,
) {
    // ensure session exists
    const sessionExists = await ensureSession(sessionId);
    if (!sessionExists) {
        throw sessionNotFoundError(sessionId);
    }

    // generate session context (if any)
    const sessionContext = await buildSessionContext(sessionId);

    // fetch available tools from MCP server
    const tools = await getToolDefinitions();

    // generate LLM response
    const completion = await genLLMResponse({
        type: requestType,
        sysPrompt,
        userPrompt,
        sessionContext,
        tools,
    });

    // validate LLM response
    if (!isValidLLMResponse(completion)) {
        throw invalidLLMResponseError();
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

    try {
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
    } catch (error) {
        if (isAppError(error)) throw error;
        console.error("Error saving conversation exchange:", error);
        throw databaseError("Failed to save conversation exchange");
    }

    const response = {
        sessionId,
        message,
    };

    return response;
}
