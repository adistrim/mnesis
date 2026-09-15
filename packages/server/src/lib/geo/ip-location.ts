export type Place = {
    label: string;
    source: "precise" | "cdn" | "ip";
};

type CacheEntry = { place: Place | null; at: number };

const CACHE_TTL_MS = 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 2500;

const cache = new Map<string, CacheEntry>();

/** Loopback, private and link-local ranges never resolve — skip the round trip. */
export function isPublicIp(ip: string): boolean {
    if (!ip || ip === "::1" || ip === "127.0.0.1") return false;
    if (/^(10\.|127\.|169\.254\.|192\.168\.)/.test(ip)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return false;
    if (/^(fc|fd|fe80)/i.test(ip)) return false;
    return true;
}

export function formatPlace(
    city?: string,
    region?: string,
    country?: string,
): string | null {
    const parts = [city, region, country]
        .map((p) => p?.trim())
        .filter((p): p is string => Boolean(p));
    if (parts.length === 0) return null;
    // collapses "Singapore, Singapore, Singapore"
    return [...new Set(parts)].join(", ");
}

/**
 * City-level location from the caller's IP. Best-effort: a failure, timeout or private
 * address yields null, and the caller must then say nothing about location rather than
 * guess — the previous timezone-derived guess named the wrong city by ~1300km.
 */
export async function lookupIpLocation(ip: string): Promise<Place | null> {
    if (!isPublicIp(ip)) return null;

    const cached = cache.get(ip);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.place;

    let place: Place | null = null;

    try {
        const response = await fetch(
            `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region,country`,
            { signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) },
        );

        if (response.ok) {
            const data = (await response.json()) as {
                success?: boolean;
                city?: string;
                region?: string;
                country?: string;
            };
            if (data.success) {
                const label = formatPlace(data.city, data.region, data.country);
                if (label) place = { label, source: "ip" };
            }
        }
    } catch (error) {
        console.warn("IP location lookup failed", {
            error: error instanceof Error ? error.message : error,
        });
    }

    cache.set(ip, { place, at: Date.now() });
    return place;
}
