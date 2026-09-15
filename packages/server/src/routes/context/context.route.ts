import { Hono } from "hono";
import { getConnInfo } from "hono/bun";
import { lookupIpLocation } from "@/lib/geo/ip-location";
import { reverseGeocode } from "@/lib/geo/reverse-geocode";

export const contextRoute = new Hono();

/**
 * Warms the location caches while the user is still typing, so the first message does
 * not pay for the lookups. Returns nothing on purpose — the resolved values are only
 * ever read server-side when a chat request arrives.
 */
contextRoute.post("/warm", async (ctx) => {
    const body = (await ctx.req.json().catch(() => ({}))) as {
        latitude?: number;
        longitude?: number;
    };

    const forwarded = ctx.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    let clientIp = forwarded;
    if (!clientIp) {
        try {
            clientIp = getConnInfo(ctx).remote.address;
        } catch {
            clientIp = undefined;
        }
    }

    const work: Promise<unknown>[] = [];
    if (clientIp) work.push(lookupIpLocation(clientIp));

    const { latitude, longitude } = body;
    if (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Math.abs(latitude) <= 90 &&
        Math.abs(longitude) <= 180
    ) {
        work.push(reverseGeocode(latitude, longitude));
    }

    await Promise.allSettled(work);
    return ctx.body(null, 204);
});
