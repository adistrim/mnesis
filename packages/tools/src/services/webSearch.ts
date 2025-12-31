import { search, fetchContent } from "quack-search";

export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    rank: number;
}

export interface SearchResponse {
    query: string;
    results: WebSearchResult[];
}

export interface FetchResponse {
    url: string;
    success: boolean;
    content?: string;
    reason?: string;
}

/**
 * Performs a web search using the given query
 */
export async function performWebSearch(
    query: string,
    maxResults: number = 5,
): Promise<SearchResponse> {
    try {
        const results = await search(query, { maxResults });
        return {
            query,
            results: results.map((r) => ({
                title: r.title,
                url: r.url,
                snippet: r.snippet,
                rank: r.rank,
            })),
        };
    } catch (error) {
        console.error("Web search error:", error);
        return {
            query,
            results: [],
        };
    }
}

/**
 * Fetches content from a specific URL
 */
export async function fetchWebContent(url: string): Promise<FetchResponse> {
    try {
        const page = await fetchContent(url);
        if (!page.success) {
            return {
                url,
                success: false,
                reason: page.reason,
            };
        }
        return {
            url,
            success: true,
            content: page.text,
        };
    } catch (error) {
        console.error("Fetch content error:", error);
        return {
            url,
            success: false,
            reason: "Failed to fetch content",
        };
    }
}
