import { settings } from "@/config/settings";
import { fetchWithRetry } from "./mcpFetch";
import type { McpResponse, ToolCall, ToolResult } from "@/types/tools.type";
import { buildToolErrorResult } from "@/utils/tool-utils";

/**
 * Calls the MCP tools server to execute a tool
 */
async function callMcpTool(name: string, args: Record<string, unknown>): Promise<string> {
    const response = await fetchWithRetry(
        `${settings.MCP_TOOLS_URL}/mcp`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: Date.now(),
                method: "tools/call",
                params: {
                    name,
                    arguments: args,
                },
            }),
        },
        {
            timeoutMs: 10_000,
            retries: 1,
            backoffMs: 200,
        },
    );

    if (!response.ok) {
        throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
    }

    let data: McpResponse;
    try {
        data = (await response.json()) as McpResponse;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? `Invalid JSON from MCP server: ${error.message}`
                : "Invalid JSON from MCP server",
        );
    }

    if (data.error) {
        throw new Error(`MCP tool error: ${data.error.message}`);
    }

    // Extract text content from MCP response
    const textContent = data.result?.content?.find((c) => c.type === "text");
    return textContent?.text ?? JSON.stringify(data.result);
}

export async function executeTool(toolCall: ToolCall): Promise<ToolResult> {
    const { id, function: fn } = toolCall;

    let args: Record<string, unknown>;
    try {
        args = JSON.parse(fn.arguments);
    } catch (error) {
        console.error("Tool argument parsing failed", {
            toolCallId: id,
            toolName: fn.name,
            rawArguments: fn.arguments,
            error,
        });
        return buildToolErrorResult(id, fn.name, error, {
            reason: "invalid_arguments",
            rawArguments: fn.arguments,
        });
    }

    console.log("Tool execution started", {
        toolCallId: id,
        toolName: fn.name,
        arguments: args,
    });

    try {
        const content = await callMcpTool(fn.name, args);

        console.log("Tool execution completed", {
            toolCallId: id,
            toolName: fn.name,
            resultSize: content.length,
        });

        return {
            tool_call_id: id,
            role: "tool",
            content,
        };
    } catch (error) {
        console.error("Tool execution failed", {
            toolCallId: id,
            toolName: fn.name,
            arguments: args,
            error,
        });
        return buildToolErrorResult(id, fn.name, error, {
            reason: "execution_failed",
        });
    }
}

export async function executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    console.log("Tool batch started", {
        toolCount: toolCalls.length,
        toolNames: toolCalls.map((tc) => tc.function.name),
    });

    const results = await Promise.allSettled(toolCalls.map(executeTool));
    return results.map((result, index) => {
        if (result.status === "fulfilled") {
            return result.value;
        }
        const toolCall = toolCalls[index];
        return buildToolErrorResult(
            toolCall?.id ?? `tool-${index}`,
            toolCall?.function?.name ?? "unknown_tool",
            result.reason,
            { reason: "execution_failed" },
        );
    });
}
