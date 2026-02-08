import { SERVER_NAME, SERVER_VERSION } from "../config";
import { logger } from "../lib/logger";
import type { JsonRpcResponse } from "../types/json-rpc.type";
import { success } from "./success-handler";

export async function handleInitialize(id: string | number | undefined): Promise<JsonRpcResponse> {
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
