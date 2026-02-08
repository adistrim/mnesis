import { Hono } from "hono";
import { handleMcpRequest } from "../handler/mcp-handler";
import { error } from "../handler/error-handler";
import { logger } from "../lib/logger";

const app = new Hono();

app.post("/mcp", async (c) => {
    try {
        const body = await c.req.json();

        // Handle batch requests
        if (Array.isArray(body)) {
            logger.debug("Batch MCP request received", { requestCount: body.length });
            const responses = await Promise.all(body.map(handleMcpRequest));
            return c.json(responses);
        }

        // Handle single request
        logger.debug("MCP request received", { method: body.method, id: body.id });
        const response = await handleMcpRequest(body);
        return c.json(response);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logger.error("MCP request parse error", { error: message });
        return c.json(error(undefined, -32700, `Parse error: ${message}`), 400);
    }
});
