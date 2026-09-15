import type { ToolCall, ToolResult } from "@/types/tools.type";
import { buildToolErrorResult } from "@/utils/tool-utils";
import { toolRegistry } from "./registry";
import { extractSources, mergeSources, type SourceRef } from "./sources";

type ExecutedTool = { result: ToolResult; sources: SourceRef[] };

export async function executeTool(toolCall: ToolCall): Promise<ExecutedTool> {
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
        return {
            result: buildToolErrorResult(id, fn.name, error, {
                reason: "invalid_arguments",
                rawArguments: fn.arguments,
            }),
            sources: [],
        };
    }

    const handler = toolRegistry[fn.name];
    if (!handler) {
        console.error("Unknown tool requested", { toolCallId: id, toolName: fn.name });
        return {
            result: buildToolErrorResult(id, fn.name, new Error(`Unknown tool: ${fn.name}`), {
                reason: "unknown_tool",
            }),
            sources: [],
        };
    }

    console.log("Tool execution started", {
        toolCallId: id,
        toolName: fn.name,
        arguments: args,
    });

    try {
        const raw = await handler(args);
        const content = JSON.stringify(raw);

        console.log("Tool execution completed", {
            toolCallId: id,
            toolName: fn.name,
            resultSize: content.length,
        });

        return {
            // Sources ride alongside, never on the ToolResult itself — that object becomes
            // a `tool` message and DeepSeek rejects unknown fields on request messages.
            result: { tool_call_id: id, role: "tool", content },
            sources: extractSources(fn.name, raw),
        };
    } catch (error) {
        console.error("Tool execution failed", {
            toolCallId: id,
            toolName: fn.name,
            arguments: args,
            error,
        });
        return {
            result: buildToolErrorResult(id, fn.name, error, {
                reason: "execution_failed",
            }),
            sources: [],
        };
    }
}

export async function executeTools(
    toolCalls: ToolCall[],
): Promise<{ results: ToolResult[]; sources: SourceRef[] }> {
    console.log("Tool batch started", {
        toolCount: toolCalls.length,
        toolNames: toolCalls.map((tc) => tc.function.name),
    });

    const settled = await Promise.allSettled(toolCalls.map(executeTool));

    const results: ToolResult[] = [];
    let sources: SourceRef[] = [];

    settled.forEach((outcome, index) => {
        if (outcome.status === "fulfilled") {
            results.push(outcome.value.result);
            sources = mergeSources(sources, outcome.value.sources);
            return;
        }

        const toolCall = toolCalls[index];
        results.push(
            buildToolErrorResult(
                toolCall?.id ?? `tool-${index}`,
                toolCall?.function?.name ?? "unknown_tool",
                outcome.reason,
                { reason: "execution_failed" },
            ),
        );
    });

    return { results, sources };
}
