import { Hono } from "hono";
import { SERVER_NAME, SERVER_VERSION } from "../config";

const app = new Hono();

app.get("/health", (c) => {
    return c.json({ status: "ok", server: SERVER_NAME, version: SERVER_VERSION });
});
