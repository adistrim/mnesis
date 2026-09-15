import type { promptType } from "@/prompts/prompt.type";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources";
import type { ResolvedContext } from "./request-context";

export const ROLE = {
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
} as const;

export interface GenLLMResponseParams {
    model: string;
    sysPrompt: promptType;
    userPrompt: string;
    sessionContext?: Array<ChatCompletionMessageParam>;
    requestContext?: ResolvedContext;
    tools?: Array<ChatCompletionTool>;
}

export type CustomResponseType = {
    content: string;
    reasoning_content?: string;
};
