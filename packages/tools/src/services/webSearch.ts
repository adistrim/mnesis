import {
    search,
    fetchContent,
    QuackBinaryError,
    QuackRuntimeError,
} from "quack-search";
import {
    FETCH_TIMEOUT_MS,
    WEB_SEARCH_MAX_RESULTS_DEFAULT,
    WEB_SEARCH_MAX_RESULTS_MAX,
    WEB_SEARCH_TIMEOUT_MS,
} from "../config";

export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    rank: number;
}

export interface SearchResponse {
    success: boolean;
    query: string;
    results: WebSearchResult[];
    error?: ErrorDetails;
}

export interface FetchResponse {
    url: string;
    success: boolean;
    content?: string;
    reason?: string;
    truncated?: boolean;
    error?: ErrorDetails;
}

interface ErrorDetails {
    type: string;
    message: string;
    code?: string;
    details?: string;
}

function buildErrorDetails(error: unknown): ErrorDetails {
    if (error instanceof QuackBinaryError) {
        return {
            type: "binary_error",
            message: error.message,
            code: error.code,
            details: error.hint,
        };
    }
    if (error instanceof QuackRuntimeError) {
        return {
            type: "runtime_error",
            message: error.message,
            code: error.code,
            details: error.details,
        };
    }
    if (error instanceof Error) {
        return {
            type: "unknown_error",
            message: error.message,
        };
    }
    return {
        type: "unknown_error",
        message: "Unknown error",
        details: String(error),
    };
}

function isValidUrl(url: unknown): url is string {
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

function clampMaxResults(maxResults: number | undefined): number {
    const fallback = WEB_SEARCH_MAX_RESULTS_DEFAULT;
    const value =
        typeof maxResults === "number" && Number.isFinite(maxResults)
            ? maxResults
            : fallback;
    return Math.min(Math.max(Math.floor(value), 1), WEB_SEARCH_MAX_RESULTS_MAX);
}

function resolveTimeout(value: number | undefined, fallback: number): number {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        return fallback;
    }
    return Math.floor(value);
}

function isTransientError(error: unknown): boolean {
    if (error instanceof QuackRuntimeError) {
        return ["TIMEOUT", "PROCESS_FAILED", "CORE_ERROR"].includes(error.code);
    }
    return false;
}

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

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

/**
 * Fetches content from a specific URL
 */
export async function fetchWebContent(
    url: string,
    timeoutMs?: number,
): Promise<FetchResponse> {
    if (!isValidUrl(url)) {
        return {
            url: typeof url === "string" ? url : "",
            success: false,
            reason: "invalid_url",
            error: {
                type: "validation_error",
                message: "URL must be a valid http(s) URL.",
            },
        };
    }

    const resolvedTimeout = resolveTimeout(timeoutMs, FETCH_TIMEOUT_MS);

    try {
        const page = await fetchContent(url, resolvedTimeout);
        if (!page.success) {
            return {
                url,
                success: false,
                reason: page.reason,
                truncated: page.truncated,
            };
        }
        return {
            url,
            success: true,
            content: page.text,
            truncated: page.truncated,
        };
    } catch (error) {
        console.error("Fetch content error:", error);
        return {
            url,
            success: false,
            reason: "failed",
            error: buildErrorDetails(error),
        };
    }
}
