import type { ToolDefinition } from "../../types/definition.type";

export const WEB_SEARCH_TOOL = "web_search";

export const webSearchTool: ToolDefinition = {
    name: WEB_SEARCH_TOOL,
    description: "Search the web for current information. Use this when you need up-to-date information, recent events, or facts you're uncertain about. Returns a list of relevant web pages with titles, URLs, snippets (brief descriptions), and ranking. The snippets often contain enough information to answer the user's question without needing to fetch the full page content.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The search query to find relevant information on the web",
            },
            maxResults: {
                type: "number",
                description: "Maximum number of search results to return. Use fewer results for simple queries, more for complex research. Default is 10.",
            },
        },
        required: ["query"],
    },
};
