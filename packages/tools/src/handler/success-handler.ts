import type { JsonRpcResponse } from "../types/json-rpc.type";

export function success(id: string | number | undefined, result: unknown): JsonRpcResponse {
    return { jsonrpc: "2.0", id: id ?? null, result };
}
