import type { ChatCompletionTool } from "openai/resources";
import { settings } from "@/config/settings";
import { fetchWithRetry } from "./mcpFetch";

interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, unknown>;
        required?: string[];
    };
}

interface McpToolsListResponse {
    jsonrpc: "2.0";
    id: string | number | null;
    result?: {
        tools: McpToolDefinition[];
    };
    error?: {
        code: number;
        message: string;
    };
}

// Cache for tool definitions
let cachedToolDefinitions: ChatCompletionTool[] | null = null;

/**
 * Fetches tool definitions from the MCP tools server
 */
export async function getToolDefinitions(): Promise<ChatCompletionTool[]> {
    if (cachedToolDefinitions) {
        return cachedToolDefinitions;
    }

    try {
        const response = await fetchWithRetry(
            `${settings.MCP_TOOLS_URL}/mcp`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: Date.now(),
                    method: "tools/list",
                    params: {},
                }),
            },
            {
                timeoutMs: 10_000,
                retries: 1,
                backoffMs: 200,
            },
        );

        if (!response.ok) {
            throw new Error(
                `MCP server error: ${response.status} ${response.statusText}`,
            );
        }

        let data: McpToolsListResponse;
        try {
            data = (await response.json()) as McpToolsListResponse;
        } catch (error) {
            throw new Error(
                error instanceof Error
                    ? `Invalid JSON from MCP server: ${error.message}`
                    : "Invalid JSON from MCP server",
            );
        }

        if (data.error) {
            throw new Error(`MCP tools/list error: ${data.error.message}`);
        }

        const mcpTools = data.result?.tools ?? [];

        // Convert MCP tool definitions to OpenAI format
        cachedToolDefinitions = mcpTools.map((tool) => ({
            type: "function" as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
            },
        }));

        return cachedToolDefinitions;
    } catch (error) {
        console.error("Failed to fetch MCP tool definitions", { error });
        return cachedToolDefinitions ?? [];
    }
}

/**
 * Clears the cached tool definitions (useful for testing or hot reload)
 */
export function clearToolDefinitionsCache(): void {
    cachedToolDefinitions = null;
}
