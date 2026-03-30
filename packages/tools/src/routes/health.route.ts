import { Hono } from "hono";
import { SERVER_NAME, SERVER_VERSION } from "../config";
import { getQuackBinaryStatus } from "../lib/quack-binary";

const app = new Hono();

app.get("/", (c) => {
    const quackBinaryStatus = getQuackBinaryStatus();

    return c.json({
        status: "ok",
        server: SERVER_NAME,
        version: SERVER_VERSION,
        quackBinary: quackBinaryStatus,
    });
});

export default app;
