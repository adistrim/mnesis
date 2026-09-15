import { z } from "zod";

export const chatRequestDto = z.object({
    prompt: z.string().min(1, "Prompt cannot be empty"),
    model: z.string().min(1).optional(),
    context: z
        .object({
            timeZone: z.string().min(1).max(64),
            locale: z.string().min(2).max(35).optional(),
            latitude: z.number().min(-90).max(90).optional(),
            longitude: z.number().min(-180).max(180).optional(),
        })
        .optional(),
    sessionId: z.uuid().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestDto>;
