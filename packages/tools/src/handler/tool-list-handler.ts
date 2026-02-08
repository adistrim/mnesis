import { toolDefinitions } from "../definitions";
import { logger } from "../lib/logger";
import type { JsonRpcResponse } from "../types/json-rpc.type";
import { success } from "./success-handler";

export async function handleToolList(id: string | number | undefined): Promise<JsonRpcResponse> {
    logger.info("Tools list requested", { requestId: id, toolCount: toolDefinitions.length });
    return success(id, {
        tools: toolDefinitions,
    });
}
