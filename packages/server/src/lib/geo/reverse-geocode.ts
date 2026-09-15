import { formatPlace } from "./ip-location";

type CacheEntry = { label: string | null; at: number };

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 2500;

const cache = new Map<string, CacheEntry>();

/** ~110m buckets: enough to name a place, and it keeps exact positions out of memory. */
function cacheKey(latitude: number, longitude: number): string {
    return `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
}

/**
 * Turns granted coordinates into a place name so the prompt never carries raw numbers.
 * Returns null on failure, leaving the caller to fall back to a coarser source.
 */
export async function reverseGeocode(
    latitude: number,
    longitude: number,
): Promise<string | null> {
    const key = cacheKey(latitude, longitude);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.label;

    let label: string | null = null;

    try {
        const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
        url.searchParams.set("latitude", String(latitude));
        url.searchParams.set("longitude", String(longitude));
        url.searchParams.set("localityLanguage", "en");

        const response = await fetch(url, {
            signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
        });

        if (response.ok) {
            const data = (await response.json()) as {
                city?: string;
                locality?: string;
                principalSubdivision?: string;
                countryName?: string;
            };
            label = formatPlace(
                data.city || data.locality,
                data.principalSubdivision,
                data.countryName,
            );
        }
    } catch (error) {
        console.warn("Reverse geocode failed", {
            error: error instanceof Error ? error.message : error,
        });
    }

    cache.set(key, { label, at: Date.now() });
    return label;
}
