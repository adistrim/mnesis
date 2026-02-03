import { Hono } from "hono";
import { v1Routes } from "@/routes";

const app = new Hono();

app.route("/api/v1", v1Routes);

export default app;
