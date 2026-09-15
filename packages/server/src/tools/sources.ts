import { FETCH_WEB_CONTENT_TOOL, WEB_SEARCH_TOOL } from "./definitions";
import type { FetchResponse, SearchResponse } from "./functions/types";

export type SourceRef = {
    url: string;
    title: string;
};

/**
 * Matching key for a URL the model typed against one a tool returned. Trailing slashes,
 * fragments and host casing differ routinely and should not cost a citation.
 */
const TRACKING_PARAMS = [
    "fbclid", "gclid", "mc_cid", "mc_eid", "ref", "ref_src", "igshid",
];

export function normalizeUrl(url: string): string {
    try {
        const parsed = new URL(url);

        // Search providers hand back tracking-decorated URLs; the model may echo or drop
        // them. Neither should cost a citation.
        for (const key of [...parsed.searchParams.keys()]) {
            if (key.startsWith("utm_") || TRACKING_PARAMS.includes(key)) {
                parsed.searchParams.delete(key);
            }
        }
        parsed.searchParams.sort();

        const host = parsed.host.toLowerCase().replace(/^www\./, "");
        const path = parsed.pathname.replace(/\/$/, "");
        return `${host}${path}${parsed.search}`;
    } catch {
        return url.trim().toLowerCase();
    }
}

/** Same key without the query, used only as an unambiguous fallback. */
function pathKey(url: string): string {
    try {
        const parsed = new URL(url);
        const host = parsed.host.toLowerCase().replace(/^www\./, "");
        return `${host}${parsed.pathname.replace(/\/$/, "")}`;
    } catch {
        return url.trim().toLowerCase();
    }
}

function hostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

export function isSafeHttpUrl(url: string): boolean {
    try {
        const { protocol } = new URL(url);
        return protocol === "http:" || protocol === "https:";
    } catch {
        return false;
    }
}

export function hostLabel(url: string): string {
    return hostname(url);
}

export function extractSources(toolName: string, result: unknown): SourceRef[] {
    if (!result || typeof result !== "object") return [];

    if (toolName === WEB_SEARCH_TOOL) {
        const search = result as SearchResponse;
        if (!search.success || !Array.isArray(search.results)) return [];
        return search.results
            .filter((r) => r.url && isSafeHttpUrl(r.url))
            .map((r) => ({ url: r.url, title: r.title || hostname(r.url) }));
    }

    if (toolName === FETCH_WEB_CONTENT_TOOL) {
        const fetched = result as FetchResponse;
        // The fetch URL comes from model-supplied tool arguments, so it is only
        // trustworthy once the fetch actually succeeded.
        if (!fetched.success || !fetched.url || !isSafeHttpUrl(fetched.url)) return [];
        return [{ url: fetched.url, title: hostname(fetched.url) }];
    }

    return [];
}

/** Appends `incoming` to `registry`, skipping URLs already present. */
export function mergeSources(registry: SourceRef[], incoming: SourceRef[]): SourceRef[] {
    const seen = new Set(registry.map((s) => normalizeUrl(s.url)));
    const merged = [...registry];

    for (const source of incoming) {
        const key = normalizeUrl(source.url);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(source);
    }

    return merged;
}

const MARKDOWN_LINK = /\[[^\]]*\]\(\s*(<[^>]*>|[^\s)]+)/g;

/**
 * The sources actually cited, ordered by first appearance in the answer. The model's own
 * numbering is ignored — only the URL it linked to matters.
 */
export function citedSources(content: string, registry: SourceRef[]): SourceRef[] {
    if (registry.length === 0 || !content) return [];

    const byKey = new Map(registry.map((s) => [normalizeUrl(s.url), s]));

    // Path-only index, kept only where a single source owns that path — so a model that
    // bolts on a tracking param still resolves, without conflating two pages that
    // genuinely differ by query.
    const byPath = new Map<string, SourceRef | null>();
    for (const source of registry) {
        const key = pathKey(source.url);
        byPath.set(key, byPath.has(key) ? null : source);
    }

    const cited: SourceRef[] = [];
    const seen = new Set<string>();

    for (const match of content.matchAll(MARKDOWN_LINK)) {
        const href = (match[1] ?? "").replace(/^<|>$/g, "");
        const source = byKey.get(normalizeUrl(href)) ?? byPath.get(pathKey(href)) ?? null;
        if (!source) continue;

        const key = normalizeUrl(source.url);
        if (seen.has(key)) continue;
        seen.add(key);
        cited.push(source);
    }

    return cited;
}
