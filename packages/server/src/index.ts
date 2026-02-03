import { Hono } from "hono";
import { v1Routes } from "@/routes";
import { serveStatic } from "hono/bun";
import { readFile } from "fs/promises";

const app = new Hono();

app.route("/api/v1", v1Routes);

app.use("/assets/*", serveStatic({ root: "./public" }));

let cachedIndex: string | undefined;

app.get("*", async (c) => {
  if (!cachedIndex) {
    cachedIndex = await readFile("./public/index.html", "utf-8");
  }
  return c.html(cachedIndex);
});

export default app;
