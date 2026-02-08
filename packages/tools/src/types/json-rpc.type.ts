export type JsonRpcRequest ={
    jsonrpc: "2.0";
    id?: string | number;
    method: string;
    params?: Record<string, unknown>;
}

export type JsonRpcResponse ={
    jsonrpc: "2.0";
    id?: string | number | null;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}
