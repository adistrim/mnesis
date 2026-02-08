import type { ErrorDetails } from "./error.type";

export type WebSearchResult = {
    title: string;
    url: string;
    snippet: string;
    rank: number;
}

export type SearchResponse = {
    success: boolean;
    query: string;
    results: WebSearchResult[];
    error?: ErrorDetails;
}

export type FetchResponse = {
    url: string;
    success: boolean;
    content?: string;
    reason?: string;
    truncated?: boolean;
    error?: ErrorDetails;
}
