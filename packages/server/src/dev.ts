import { settings } from "@/config/settings";
import { v1Routes } from "@/routes";
import { serve } from "bun";
import { Hono } from "hono";
import { serveStatic } from 'hono/bun'
import { readFile } from "fs/promises";
import { cors } from 'hono/cors'

const app = new Hono()

app.use("/api/v1/*", cors({ origin: settings.CORS_ALLOWED_ORIGINS }))

app.route("/api/v1", v1Routes);

app.use('/assets/*', serveStatic({ root: './public' }))

let cachedIndex: string;
app.get('*', async ctx => {
    if (!cachedIndex) {
        cachedIndex = await readFile('./public/index.html', 'utf-8');
    }
    return ctx.html(cachedIndex);
});

serve({
    port: settings.PORT,
    fetch: app.fetch,
});

console.log(`
    Mnesis running
    URL: ${settings.HOST}:${settings.PORT}
    Press Ctrl+C to stop.
`);
