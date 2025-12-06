import type { promptType } from "@/prompts/prompt.type";
import type { ChatCompletionMessageParam } from "openai/resources";

export enum LLMRequestType {
    Chat = "chat",
    Reasoning = "reasoning",
}

export const ROLE = {
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
} as const;

export const MODEL = {
    CHAT: "deepseek-chat",
    REASONING: "deepseek-reasoner",
} as const;

export interface GenLLMResponseParams {
    type: LLMRequestType;
    sysPrompt: promptType;
    userPrompt: string;
    sessionContext?: Array<ChatCompletionMessageParam>;
}

export type CustomResponseType = {
    content: string;
    reasoning_content?: string;
};
