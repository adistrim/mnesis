import { Hono } from "hono";
import { cors } from "hono/cors";
import { toolDefinitions, WEB_SEARCH_TOOL, FETCH_WEB_CONTENT_TOOL } from "./definitions";
import { performWebSearch, fetchWebContent } from "./services/webSearch";
import { Logger } from "./lib/logging/logger";

const SERVER_NAME = "mnesis-tools";
const SERVER_VERSION = "0.0.1";

const logger = new Logger();

// JSON-RPC types
interface JsonRpcRequest {
    jsonrpc: "2.0";
    id?: string | number;
    method: string;
    params?: Record<string, unknown>;
}

interface JsonRpcResponse {
    jsonrpc: "2.0";
    id?: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}

// MCP response helpers
function success(id: string | number | undefined, result: unknown): JsonRpcResponse {
    return { jsonrpc: "2.0", id: id ?? null, result };
}

function error(id: string | number | undefined, code: number, message: string, data?: unknown): JsonRpcResponse {
    return { jsonrpc: "2.0", id: id ?? null, error: { code, message, data } };
}

// MCP method handlers
async function handleInitialize(id: string | number | undefined): Promise<JsonRpcResponse> {
    logger.info("MCP initialize request received", { requestId: id });
    return success(id, {
        capabilities: {
            tools: {},
        },
        serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION,
        },
    });
}

async function handleToolsList(id: string | number | undefined): Promise<JsonRpcResponse> {
    logger.info("Tools list requested", { requestId: id, toolCount: toolDefinitions.length });
    return success(id, {
        tools: toolDefinitions,
    });
}

async function handleToolsCall(id: string | number | undefined, params: Record<string, unknown>): Promise<JsonRpcResponse> {
    const { name, arguments: rawArgs } = params as {
        name?: string;
        arguments?: Record<string, unknown>;
    };
    const args =
        rawArgs && typeof rawArgs === "object" ? rawArgs : ({} as Record<string, unknown>);

    logger.info("Tool execution started", {
        requestId: id,
        toolName: name,
        arguments: args,
    });

    try {
        let result: unknown;

        switch (name) {
            case WEB_SEARCH_TOOL: {
                const query = args.query as string;
                const maxResults = args.maxResults as number | undefined;
                const timeoutMs = args.timeoutMs as number | undefined;
                result = await performWebSearch(query, maxResults, timeoutMs);
                break;
            }

            case FETCH_WEB_CONTENT_TOOL: {
                const url = args.url as string;
                const timeoutMs = args.timeoutMs as number | undefined;
                result = await fetchWebContent(url, timeoutMs);
                break;
            }

            default:
                logger.warn("Unknown tool requested", {
                    requestId: id,
                    toolName: name,
                    arguments: args,
                });
                return error(id, -32602, `Unknown tool: ${name}`);
        }

        logger.info("Tool execution completed", {
            requestId: id,
            toolName: name,
            resultSize: JSON.stringify(result).length,
        });

        return success(id, {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result, null, 2),
                },
            ],
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logger.error("Tool execution failed", {
            requestId: id,
            toolName: name,
            arguments: args,
            error: err instanceof Error ? { name: err.name, message: err.message } : err,
        });
        return error(id, -32603, `Tool execution failed: ${message}`);
    }
}

// Main request handler
async function handleMcpRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params = {} } = request;

    switch (method) {
        case "initialize":
            return handleInitialize(id);

        case "notifications/initialized":
            return success(id, {});

        case "tools/list":
            return handleToolsList(id);

        case "tools/call":
            return handleToolsCall(id, params);

        default:
            return error(id, -32601, `Method not found: ${method}`);
    }
}

// Create the Hono app
const app = new Hono();

// Enable CORS
app.use(
    "*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
    })
);

// Health check endpoint
app.get("/health", (c) => {
    return c.json({ status: "ok", server: SERVER_NAME, version: SERVER_VERSION });
});

// MCP endpoint
app.post("/mcp", async (c) => {
    try {
        const body = await c.req.json();

        // Handle batch requests
        if (Array.isArray(body)) {
            logger.debug("Batch MCP request received", { requestCount: body.length });
            const responses = await Promise.all(body.map(handleMcpRequest));
            return c.json(responses);
        }

        // Handle single request
        logger.debug("MCP request received", { method: body.method, id: body.id });
        const response = await handleMcpRequest(body);
        return c.json(response);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logger.error("MCP request parse error", { error: message });
        return c.json(error(undefined, -32700, `Parse error: ${message}`), 400);
    }
});

export default app;
export { SERVER_NAME, SERVER_VERSION, logger };
