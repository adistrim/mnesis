import { search } from "quack-search";
import {
    WEB_SEARCH_TIMEOUT_MS,
} from "../config";
import type { SearchResponse } from "../types/web-service.type";
import { clampMaxResults, resolveTimeout, sleep } from "../utils";
import { buildErrorDetails, isTransientError } from "../errors";

/**
 * Performs a web search using the given query
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
    const resolvedTimeout = resolveTimeout(timeoutMs, WEB_SEARCH_TIMEOUT_MS);

    try {
        const results = await search(query, {
            maxResults: boundedMaxResults,
            timeoutMs: resolvedTimeout,
        });
        return {
            success: true,
            query,
            results: results.map((r) => ({
                title: r.title,
                url: r.url,
                snippet: r.snippet,
                rank: r.rank,
            })),
        };
    } catch (error) {
        if (isTransientError(error)) {
            await sleep(250);
            try {
                const results = await search(query, {
                    maxResults: boundedMaxResults,
                    timeoutMs: resolvedTimeout,
                });
                return {
                    success: true,
                    query,
                    results: results.map((r) => ({
                        title: r.title,
                        url: r.url,
                        snippet: r.snippet,
                        rank: r.rank,
                    })),
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
        console.error("Web search error:", error);
        return {
            success: false,
            query,
            results: [],
            error: buildErrorDetails(error),
        };
    }
}
