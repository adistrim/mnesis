import type { ToolCall, ToolResult } from "@/types/tools.type";
import { buildToolErrorResult } from "@/utils/tool-utils";
import { toolRegistry } from "./registry";

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

    const handler = toolRegistry[fn.name];
    if (!handler) {
        console.error("Unknown tool requested", { toolCallId: id, toolName: fn.name });
        return buildToolErrorResult(id, fn.name, new Error(`Unknown tool: ${fn.name}`), {
            reason: "unknown_tool",
        });
    }

    console.log("Tool execution started", {
        toolCallId: id,
        toolName: fn.name,
        arguments: args,
    });

    try {
        const content = JSON.stringify(await handler(args));

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
