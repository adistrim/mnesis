import { settings } from "@/config/settings";
import OpenAI from "openai";
import {
    MODEL,
    ROLE,
    LLMRequestType,
    type GenLLMResponseParams,
} from "./openai.types";
import type { ChatCompletion } from "openai/resources";

/*
    source: https://api-docs.deepseek.com/quick_start/parameter_settings
    date: 29/11/2025 (DD/MM/YYYY)
    The Temperature Parameter:
        Coding / Math = 0.0
        Data Cleaning / Data Analysis = 1.0
        General Conversation = 1.3
        Translation = 1.3
        Creative Writing / Poetry = 1.5
*/

const TEMPERATURE = 1.3;

const openai = new OpenAI({
    baseURL: settings.LLM_HOST,
    apiKey: settings.LLM_HOST_API,
});

export async function genLLMResponse(
    params: GenLLMResponseParams,
): Promise<ChatCompletion> {
    const { type, sysPrompt, userPrompt } = params;

    let model;

    if (type == LLMRequestType.Chat) {
        model = MODEL.CHAT;
    } else if (type == LLMRequestType.Reasoning) {
        model = MODEL.REASONING;
    } else {
        throw new Error(
            `Invalid request type: ${type}. Expected a value from LLMRequestType.`,
        );
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: ROLE.SYSTEM, content: sysPrompt.content },
                { role: ROLE.USER, content: userPrompt },
            ],
            model: model,
            temperature: TEMPERATURE,
        });

        return completion;
    } catch (e) {
        throw new Error(`(Gen LLM Response) LLM Host Error ${e}`);
    }
}
