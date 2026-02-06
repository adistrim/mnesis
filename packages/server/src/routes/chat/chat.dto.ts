import { z } from "zod";
import { LLMRequestType } from "@/lib/openai/openai.type";

export const chatRequestDto = z.object({
    prompt: z.string().min(1, "Prompt cannot be empty"),
    type: z.enum(LLMRequestType).optional(),
    sessionId: z.uuid().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestDto>;
