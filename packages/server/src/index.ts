import { Hono } from "hono";
import { v1Routes } from "./routes";
import { handle } from "hono/vercel";

const app = new Hono();

app.route("/api/v1", v1Routes);

export default handle(app);
