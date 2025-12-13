import { settings } from "@/config/settings";
import { v1Routes } from "./routes";
import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono()

app.use("*", cors({
    origin: settings.CORS_ALLOWED_ORIGINS.length > 0
        ? settings.CORS_ALLOWED_ORIGINS
        : [],
}));

app.route("/api/v1", v1Routes);

serve({
    port: settings.PORT,
    fetch: app.fetch,
});

console.log(`
    Server running
    URL: ${settings.HOST}:${settings.PORT}
    CORS Allowed Origins: ${settings.CORS_ALLOWED_ORIGINS.join(", ") || "none"}
    Press Ctrl+C to stop.
`);
