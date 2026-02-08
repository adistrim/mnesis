import { QuackRuntimeError } from "quack-search";
import { WEB_SEARCH_MAX_RESULTS_DEFAULT, WEB_SEARCH_MAX_RESULTS_MAX } from "../config";

export function isValidUrl(url: unknown): url is string {
    if (typeof url !== "string" || url.trim().length === 0) {
        return false;
    }
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export function clampMaxResults(maxResults: number | undefined): number {
    const fallback = WEB_SEARCH_MAX_RESULTS_DEFAULT;
    const value =
        typeof maxResults === "number" && Number.isFinite(maxResults)
            ? maxResults
            : fallback;
    return Math.min(Math.max(Math.floor(value), 1), WEB_SEARCH_MAX_RESULTS_MAX);
}

export function resolveTimeout(value: number | undefined, fallback: number): number {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        return fallback;
    }
    return Math.floor(value);
}


export async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}
