import { settings } from "@/config/settings";
import { routes } from "./routes";
import { serve } from "bun";

serve({
    port: settings.PORT,
    routes
});

console.log(`Server started on port ${settings.PORT}`);
