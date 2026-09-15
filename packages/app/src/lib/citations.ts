export type SourceRef = {
    url: string;
    title: string;
};

const TRACKING_PARAMS = [
    "fbclid", "gclid", "mc_cid", "mc_eid", "ref", "ref_src", "igshid",
];

/** Mirrors the server's key so live and reloaded turns number identically. */
export function normalizeUrl(url: string): string {
    try {
        const parsed = new URL(url);

        for (const key of [...parsed.searchParams.keys()]) {
            if (key.startsWith("utm_") || TRACKING_PARAMS.includes(key)) {
                parsed.searchParams.delete(key);
            }
        }
        parsed.searchParams.sort();

        const host = parsed.host.toLowerCase().replace(/^www\./, "");
        return `${host}${parsed.pathname.replace(/\/$/, "")}${parsed.search}`;
    } catch {
        return url.trim().toLowerCase();
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
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

const MARKDOWN_LINK = /\[[^\]]*\]\(\s*(<[^>]*>|[^\s)]+)/g;

/** Cited sources in order of first appearance — the same rule the server persists by. */
export function citedSources(content: string, registry: SourceRef[]): SourceRef[] {
    if (registry.length === 0 || !content) return [];

    const byKey = new Map(registry.map((s) => [normalizeUrl(s.url), s]));
    const cited: SourceRef[] = [];
    const seen = new Set<string>();

    for (const match of content.matchAll(MARKDOWN_LINK)) {
        const href = (match[1] ?? "").replace(/^<|>$/g, "");
        const source = byKey.get(normalizeUrl(href));
        if (!source) continue;

        const key = normalizeUrl(source.url);
        if (seen.has(key)) continue;
        seen.add(key);
        cited.push(source);
    }

    return cited;
}

/**
 * A markdown link only becomes a link once its closing paren lands, so mid-stream the
 * buffer ends in raw text like `[1](https://git`. Drop that tail while streaming only.
 */
export function hideIncompleteLink(content: string): string {
    return content.replace(/\[[^\]\n]*(\][^)\n]*)?$/, "");
}
