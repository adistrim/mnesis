import { Hono } from "hono";
import { cors } from "hono/cors";
import healthRoute from "./routes/health.route";
import mcpRoute from "./routes/mcp.route";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
    })
);

app.route("/health", healthRoute);
app.route("/mcp", mcpRoute);

export default app;
