import { fetchContent } from "quack-search";
import { FETCH_TIMEOUT_MS } from "../config";
import type { FetchResponse } from "../types/web-service.type";
import { isValidUrl, resolveTimeout } from "../utils";
import { buildErrorDetails } from "../errors";

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
