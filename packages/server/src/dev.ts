import { settings } from "@/config/settings";
import { serve } from "bun";
import { createApp } from "./app";

const app = createApp();

serve({
    port: settings.PORT,
    fetch: app.fetch,
});

console.log(`
    Mnesis Server Running
    URL: ${settings.HOST}:${settings.PORT}
    Press Ctrl+C to stop.
`);
