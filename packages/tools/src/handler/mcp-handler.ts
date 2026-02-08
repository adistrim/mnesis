import type { JsonRpcRequest, JsonRpcResponse } from "../types/json-rpc.type";
import { error } from "./error-handler";
import { handleInitialize } from "./init-handler";
import { success } from "./success-handler";
import { handleToolsCall } from "./tool-call-handler";
import { handleToolList } from "./tool-list-handler";

export async function handleMcpRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params = {} } = request;

    switch (method) {
        case "initialize":
            return handleInitialize(id);

        case "notifications/initialized":
            return success(id, {});

        case "tools/list":
            return handleToolList(id);

        case "tools/call":
            return handleToolsCall(id, params);

        default:
            return error(id, -32601, `Method not found: ${method}`);
    }
}
