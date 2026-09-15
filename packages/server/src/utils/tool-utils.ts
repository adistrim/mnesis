import { settings } from "@/config/settings";
import type { ToolErrorDetails, ToolResult } from "@/types/tools.type";

export function buildToolErrorDetails(error: unknown): ToolErrorDetails {
    if (error instanceof Error) {
        return {
            type: "tool_error",
            message: error.message,
        };
    }
    return {
        type: "tool_error",
        message: "Unknown error",
        details: String(error),
    };
}

export function buildToolErrorResult(
    toolCallId: string,
    toolName: string,
    error: unknown,
    extra?: Record<string, unknown>,
): ToolResult {
    const payload = {
        success: false,
        tool: toolName,
        error: buildToolErrorDetails(error),
        ...extra,
    };

    return {
        tool_call_id: toolCallId,
        role: "tool",
        content: JSON.stringify(payload),
    };
}

export function clampMaxResults(maxResults: number | undefined): number {
    const value =
        typeof maxResults === "number" && Number.isFinite(maxResults)
            ? maxResults
            : settings.WEB_SEARCH_MAX_RESULTS_DEFAULT;
    return Math.min(
        Math.max(Math.floor(value), 1),
        settings.WEB_SEARCH_MAX_RESULTS_MAX,
    );
}

export function resolveTimeout(value: number | undefined, fallback: number): number {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        return fallback;
    }
    return Math.floor(value);
}
