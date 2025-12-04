import type { ChatCompletion } from "openai/resources";

export function isValidLLMResponse(
    res: ChatCompletion,
): res is ChatCompletion & {
    choices: [{ message: { content: string } }];
} {
    const c = res.choices?.[0]?.message?.content;
    return typeof c === "string" && c.trim().length > 0;
}
