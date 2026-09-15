import { search } from "quack-search";
import { settings } from "@/config/settings";
import { buildErrorDetails, isTransientError } from "@/lib/errors/error-utils";
import { clampMaxResults, resolveTimeout } from "@/utils/tool-utils";
import type { SearchResponse, WebSearchResult } from "./types";

const TRANSIENT_RETRY_DELAY_MS = 250;

async function runSearch(
    query: string,
    maxResults: number,
    timeoutMs: number,
): Promise<WebSearchResult[]> {
    const results = await search(query, { maxResults, timeoutMs });
    return results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        rank: r.rank,
    }));
}

/**
 * Performs a web search using the given query, retrying once on transient failures.
 */
export async function performWebSearch(
    query: string,
    maxResults?: number,
    timeoutMs?: number,
): Promise<SearchResponse> {
    if (typeof query !== "string" || query.trim().length === 0) {
        return {
            success: false,
            query: typeof query === "string" ? query : "",
            results: [],
            error: {
                type: "validation_error",
                message: "Query must be a non-empty string.",
            },
        };
    }

    const boundedMaxResults = clampMaxResults(maxResults);
    const resolvedTimeout = resolveTimeout(timeoutMs, settings.WEB_SEARCH_TIMEOUT_MS);

    try {
        return {
            success: true,
            query,
            results: await runSearch(query, boundedMaxResults, resolvedTimeout),
        };
    } catch (error) {
        if (!isTransientError(error)) {
            console.error("Web search error:", error);
            return { success: false, query, results: [], error: buildErrorDetails(error) };
        }

        await new Promise((resolve) => setTimeout(resolve, TRANSIENT_RETRY_DELAY_MS));

        try {
            return {
                success: true,
                query,
                results: await runSearch(query, boundedMaxResults, resolvedTimeout),
            };
        } catch (retryError) {
            console.error("Web search retry error:", retryError);
            return {
                success: false,
                query,
                results: [],
                error: buildErrorDetails(retryError),
            };
        }
    }
}
