import { settings } from "@/config/settings";
import { v1Routes } from "./routes";
import { serve } from "bun";

serve({
    port: settings.PORT,
    routes: v1Routes,
});

console.log(`
    Server running
    URL: ${settings.HOST}:${settings.PORT}
    Press Ctrl+C to stop.
`);
