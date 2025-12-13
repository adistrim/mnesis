/*

    FOR SERVERLESS DEPLOYMENT ONLY

*/


import { settings } from "@/config/settings";
import { v1Routes } from "@/routes";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors({
  origin: settings.CORS_ALLOWED_ORIGINS.length > 0
    ? settings.CORS_ALLOWED_ORIGINS
    : [],
}));

app.route("/api/v1", v1Routes);

app.get("/", ctx => {
    return ctx.text("I am alive!");
});

export default app;
