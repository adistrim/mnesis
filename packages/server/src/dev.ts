import { settings } from "@/config/settings";
import { v1Routes } from "@/routes";
import { resourceNotFoundError } from "@/lib/errors";
import { errorResponse } from "@/utils/errorResponse";
import { serve } from "bun";
import { Hono } from "hono";
import { cors } from 'hono/cors'

const app = new Hono()

app.use("/api/v1/*", cors({ origin: settings.CORS_ALLOWED_ORIGINS }))
app.route("/api/v1", v1Routes);
app.notFound(() => errorResponse(resourceNotFoundError()));
app.onError((err) => errorResponse(err));

serve({
    port: settings.PORT,
    fetch: app.fetch,
});

console.log(`
    Mnesis Server Running
    URL: ${settings.HOST}:${settings.PORT}
    Press Ctrl+C to stop.
`);
