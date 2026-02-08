import type { JsonRpcResponse } from "../types/json-rpc.type";

export function error(id: string | number | undefined, code: number, message: string, data?: unknown): JsonRpcResponse {
    return { jsonrpc: "2.0", id: id ?? null, error: { code, message, data } };
}
