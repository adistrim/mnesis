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

export interface ToolErrorDetails {
    type: string;
    message: string;
    details?: string;
}
