import OpenAI from "openai";
import { settings } from "@/config/settings";

export const openai = new OpenAI({
    baseURL: settings.LLM_HOST,
    apiKey: settings.LLM_HOST_API,
});
