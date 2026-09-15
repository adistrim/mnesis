import { formatPlace, lookupIpLocation, type Place } from "@/lib/geo/ip-location";
import { reverseGeocode } from "@/lib/geo/reverse-geocode";

export type ClientContext = {
    timeZone: string;
    locale?: string;
    /** Only present once the user has explicitly granted precise location. */
    latitude?: number;
    longitude?: number;
};

export type ResolvedContext = {
    timeZone: string;
    locale: string;
    place?: Place;
};

/** Constructing the formatter is the validation — this string reaches a prompt. */
export function isValidTimeZone(timeZone: string): boolean {
    try {
        new Intl.DateTimeFormat("en", { timeZone });
        return true;
    } catch {
        return false;
    }
}

function fromCdnHeaders(headers: Headers): Place | null {
    const read = (name: string) => {
        const value = headers.get(name)?.trim();
        return value ? decodeURIComponent(value) : undefined;
    };

    const label = formatPlace(
        read("x-vercel-ip-city") ?? read("cf-ipcity"),
        read("x-vercel-ip-country-region"),
        read("x-vercel-ip-country") ?? read("cf-ipcountry"),
    );

    return label ? { label, source: "cdn" } : null;
}

/**
 * Location, best available first: precise coordinates the user granted, then the CDN's own
 * IP lookup, then our IP lookup. If none resolve, `place` stays undefined and the prompt
 * says nothing about location.
 *
 * Time zone is used ONLY for the local clock. It is not a location: `Asia/Kolkata` is the
 * single zone for all of India, so deriving a city from it named somewhere ~1300km wrong.
 */
export async function resolveContext(
    client: ClientContext | undefined,
    headers: Headers,
    clientIp: string | undefined,
): Promise<ResolvedContext | undefined> {
    if (!client || !isValidTimeZone(client.timeZone)) return undefined;

    const context: ResolvedContext = {
        timeZone: client.timeZone,
        locale: client.locale || "en",
    };

    if (
        typeof client.latitude === "number" &&
        typeof client.longitude === "number" &&
        Math.abs(client.latitude) <= 90 &&
        Math.abs(client.longitude) <= 180
    ) {
        // Resolved to a name here so coordinates never reach the model. A failed lookup
        // falls through to the coarser sources rather than leaking numbers.
        const label = await reverseGeocode(client.latitude, client.longitude);
        if (label) {
            context.place = { label, source: "precise" };
            return context;
        }
    }

    const cdn = fromCdnHeaders(headers);
    if (cdn) {
        context.place = cdn;
        return context;
    }

    if (clientIp) {
        const ipPlace = await lookupIpLocation(clientIp);
        if (ipPlace) context.place = ipPlace;
    }

    return context;
}

/**
 * Rendered as its own message after the static system prompt, so per-user context never
 * forks the prompt's shared cache unit.
 */
export function renderContext(context: ResolvedContext): string {
    let localTime: string;
    try {
        // Explicit components, not dateStyle/timeStyle — those cannot combine with
        // timeZoneName, which is the part that makes this useful.
        localTime = new Intl.DateTimeFormat(context.locale, {
            timeZone: context.timeZone,
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
        }).format(new Date());
    } catch {
        localTime = new Date().toISOString();
    }

    // Deliberately states the facts without the mechanism. Naming the source here makes
    // the model recite it back ("based on your IP, unless you're on a VPN"), which reads
    // as surveillance rather than helpfulness.
    const lines = [`Local time: ${localTime} (${context.timeZone}).`];

    lines.push(
        context.place ? `Location: ${context.place.label}.` : "Location: unavailable.",
    );

    return lines.join(" ");
}
