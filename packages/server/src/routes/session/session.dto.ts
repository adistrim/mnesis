import { z } from "zod";

export const sessionRequestDto = z.object({
    sessionId: z.string(),
});

export type SessionRequest = z.infer<typeof sessionRequestDto>;
