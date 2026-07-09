export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string;
    };
}

export interface ToolResult {
    tool_call_id: string;
    role: "tool";
    content: string;
}

export interface McpResponse {
    jsonrpc: "2.0";
    id: string | number | null;
    result?: {
        content: Array<{ type: string; text: string }>;
    };
    error?: {
        code: number;
        message: string;
    };
}

export interface ToolErrorDetails {
    type: string;
    message: string;
    details?: string;
}
