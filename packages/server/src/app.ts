import { Hono } from "hono";
import { cors } from "hono/cors";
import { settings } from "./config/settings";
import { v1Routes } from "./routes";
import { errorResponse } from "./utils/errorResponse";
import { resourceNotFoundError } from "./lib/errors";

export function createApp(basePath = "/api") {
    const app = new Hono().basePath(basePath);

    app.use("/*", cors({ origin: settings.CORS_ALLOWED_ORIGINS }));
    app.route("/v1", v1Routes);
    app.notFound(() => errorResponse(resourceNotFoundError()));
    app.onError((err) => errorResponse(err));

    return app;
}
