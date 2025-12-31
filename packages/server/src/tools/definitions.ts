import type { ChatCompletionTool } from "openai/resources";
import { settings } from "@/config/settings";

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

    const response = await fetch(`${settings.MCP_TOOLS_URL}/mcp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/list",
            params: {},
        }),
    });

    if (!response.ok) {
        throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as McpToolsListResponse;

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
}

/**
 * Clears the cached tool definitions (useful for testing or hot reload)
 */
export function clearToolDefinitionsCache(): void {
    cachedToolDefinitions = null;
}
