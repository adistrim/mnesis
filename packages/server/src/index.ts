import { Hono } from "hono";
import { v1Routes } from "./routes";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { settings } from "./config/settings";

const app = new Hono().basePath("/api");

app.use("/*", cors({ origin: settings.CORS_ALLOWED_ORIGINS }))
app.route("/v1", v1Routes);

export default handle(app);
