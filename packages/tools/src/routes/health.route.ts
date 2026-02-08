import { Hono } from "hono";
import { SERVER_NAME, SERVER_VERSION } from "../config";

const app = new Hono();

app.get("/", (c) => {
    return c.json({ status: "ok", server: SERVER_NAME, version: SERVER_VERSION });
});

export default app;
