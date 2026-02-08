import { FETCH_WEB_CONTENT_TOOL, WEB_SEARCH_TOOL } from "../definitions";
import { logger } from "../lib/logger";
import { fetchWebContent } from "../services/fetch-web-content";
import { performWebSearch } from "../services/web-search";
import type { JsonRpcResponse } from "../types/json-rpc.type";
import { error } from "./error-handler";
import { success } from "./success-handler";

export async function handleToolsCall(id: string | number | undefined, params: Record<string, unknown>): Promise<JsonRpcResponse> {
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
