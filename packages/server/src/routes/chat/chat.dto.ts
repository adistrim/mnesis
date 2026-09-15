import { z } from "zod";

export const chatRequestDto = z.object({
    prompt: z.string().min(1, "Prompt cannot be empty"),
    model: z.string().min(1).optional(),
    sessionId: z.uuid().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestDto>;
