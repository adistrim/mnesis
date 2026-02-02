import type { ToolDefinition } from "../../types/definition.type";

export const FETCH_WEB_CONTENT_TOOL = "fetch_web_content";

export const fetchWebContentTool: ToolDefinition = {
    name: FETCH_WEB_CONTENT_TOOL,
    description: "Fetch and read the full content of a specific web page. Only use this when the search snippets don't provide enough information and you need the complete page content. Returns the text content of the page or a failure reason with success/error metadata.",
    inputSchema: {
        type: "object",
        properties: {
            url: {
                type: "string",
                description: "The URL of the web page to fetch content from",
            },
            timeoutMs: {
                type: "number",
                description: "Timeout in milliseconds for the fetch request. Default is 30000.",
            },
        },
        required: ["url"],
    },
};
