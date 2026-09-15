import type { ChatCompletionTool } from "openai/resources";

export const WEB_SEARCH_TOOL = "web_search";
export const FETCH_WEB_CONTENT_TOOL = "fetch_web_content";

const toolDefinitions: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: WEB_SEARCH_TOOL,
            description: "Search the web for current information. Use this when you need up-to-date information, recent events, or facts you're uncertain about. Returns a list of relevant web pages with titles, URLs, snippets (brief descriptions), and ranking. The snippets often contain enough information to answer the user's question without needing to fetch the full page content. Response includes success/error metadata when the search fails.",
            parameters: {
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
                    timeoutMs: {
                        type: "number",
                        description: "Timeout in milliseconds for the search request. Default is 30000.",
                    },
                },
                required: ["query"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: FETCH_WEB_CONTENT_TOOL,
            description: "Fetch and read the full content of a specific web page. Only use this when the search snippets don't provide enough information and you need the complete page content. Returns the text content of the page or a failure reason with success/error metadata.",
            parameters: {
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
        },
    },
];

export function getToolDefinitions(): ChatCompletionTool[] {
    return toolDefinitions;
}
