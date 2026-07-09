import type { ToolErrorDetails, ToolResult } from "@/types/tools.type";

export function buildToolErrorDetails(error: unknown): ToolErrorDetails {
    if (error instanceof Error) {
        return {
            type: "mcp_error",
            message: error.message,
        };
    }
    return {
        type: "mcp_error",
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
