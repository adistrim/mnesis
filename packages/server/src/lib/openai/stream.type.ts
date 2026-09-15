export type StreamUsage = {
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    cacheHitTokens: number;
    cacheMissTokens: number;
};

import type { SourceRef } from "@/tools/sources";

export type StreamEvent =
    | { type: "reasoning"; delta: string }
    | { type: "content"; delta: string }
    | { type: "tool"; name: string; status: "start" | "done" }
    | { type: "sources"; sources: SourceRef[] }
    | { type: "error"; code: string; message: string };

/**
 * Owned by the caller, mutated as the turn streams. A generator that throws or is
 * returned early never yields again, so accumulated state cannot travel as a final
 * event — abort is exactly when it is needed.
 */
export type StreamAccumulator = {
    content: string;
    reasoning: string;
    sources: SourceRef[];
    usage: StreamUsage;
    model: string;
    toolLegs: number;
};

export function createAccumulator(model: string): StreamAccumulator {
    return {
        content: "",
        reasoning: "",
        sources: [],
        usage: {
            promptTokens: 0,
            completionTokens: 0,
            reasoningTokens: 0,
            cacheHitTokens: 0,
            cacheMissTokens: 0,
        },
        model,
        toolLegs: 0,
    };
}
