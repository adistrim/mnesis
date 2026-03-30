import { Hono } from "hono";
import { cors } from "hono/cors";
import { error } from "./handler/error-handler";
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

app.notFound((c) => c.json(error(undefined, -32601, "Route not found"), 404));

app.onError((err, c) => {
    const message = err instanceof Error ? err.message : "Internal server error";
    return c.json(error(undefined, -32603, message), 500);
});

export default app;
