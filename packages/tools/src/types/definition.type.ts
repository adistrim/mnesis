export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, {
            type: string;
            description: string;
        }>;
        required?: string[];
    };
}
