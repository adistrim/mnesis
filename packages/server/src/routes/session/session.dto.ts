import { z } from "zod";

export const sessionRequestDto = z.object({
    sessionId: z.uuid(),
});

export type SessionRequest = z.infer<typeof sessionRequestDto>;
