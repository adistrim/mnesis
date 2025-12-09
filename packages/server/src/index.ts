import { settings } from "@/config/settings";
import { v1Routes } from "./routes";
import { serve } from "bun";
import { Hono } from "hono";

const app = new Hono()

app.route("/api/v1", v1Routes);

serve({
    port: settings.PORT,
    fetch: app.fetch,
});

console.log(`
    Server running
    URL: ${settings.HOST}:${settings.PORT}
    Press Ctrl+C to stop.
`);
