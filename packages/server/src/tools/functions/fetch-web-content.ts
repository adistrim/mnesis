import { fetchContent } from "quack-search";
import z from "zod";
import { settings } from "@/config/settings";
import { buildErrorDetails } from "@/lib/errors/error-utils";
import { resolveTimeout } from "@/utils/tool-utils";
import type { FetchResponse } from "./types";

export const urlSchema = z
    .url()
    .refine(u => u.startsWith("http://") || u.startsWith("https://"), {
        message: "Invalid URL format. Must be a valid http(s) URL.",
    });

/**
 * Fetches content from a specific URL
 */
export async function fetchWebContent(
    url: string,
    timeoutMs?: number,
): Promise<FetchResponse> {
    const parsedUrl = urlSchema.safeParse(url);
    if (!parsedUrl.success) {
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

    const resolvedTimeout = resolveTimeout(timeoutMs, settings.FETCH_TIMEOUT_MS);

    try {
        const page = await fetchContent(parsedUrl.data, resolvedTimeout);
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
