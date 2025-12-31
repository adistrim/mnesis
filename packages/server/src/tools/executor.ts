import { settings } from "@/config/settings";

export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string;
    };
}

export interface ToolResult {
    tool_call_id: string;
    role: "tool";
    content: string;
}

interface McpResponse {
    jsonrpc: "2.0";
    id: string | number | null;
    result?: {
        content: Array<{ type: string; text: string }>;
    };
    error?: {
        code: number;
        message: string;
    };
}

/**
 * Calls the MCP tools server to execute a tool
 */
async function callMcpTool(name: string, args: Record<string, unknown>): Promise<string> {
    const response = await fetch(`${settings.MCP_TOOLS_URL}/mcp`, {
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
    });

    if (!response.ok) {
        throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as McpResponse;

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
        throw error;
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
        throw error;
    }
}

export async function executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    console.log("Tool batch started", {
        toolCount: toolCalls.length,
        toolNames: toolCalls.map((tc) => tc.function.name),
    });

    return Promise.all(toolCalls.map(executeTool));
}
