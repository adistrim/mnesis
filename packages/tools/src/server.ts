import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
    })
);


export default app;
