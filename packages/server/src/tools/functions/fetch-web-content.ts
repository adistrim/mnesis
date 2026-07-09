import { fetchContent } from "quack-search";
import type { FetchResponse } from "./types";
import { buildErrorDetails } from "@/lib/errors/error-utils";
import z from "zod";

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
    urlSchema.parse(url);

    try {
        const page = await fetchContent(url, timeoutMs ?? 30000);
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
