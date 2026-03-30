import { IS_DEVELOPMENT, LOGGING_ENABLED, MCP_PORT, SERVER_NAME, SERVER_VERSION } from "./config";
import { initDB } from "./lib/db/init-db";
import { logger } from "./lib/logger";
import app from "./server";

if (LOGGING_ENABLED) {
    initDB();
}

logger.info("MCP Tools Server starting", {
    server: SERVER_NAME,
    version: SERVER_VERSION,
    port: MCP_PORT,
});

if (IS_DEVELOPMENT) {
    console.log(`Starting MCP Tools Server on port ${MCP_PORT}`);
    console.log(`Health check: http://localhost:${MCP_PORT}/health`);
    console.log(`MCP endpoint: http://localhost:${MCP_PORT}/mcp`);
}

export default {
    port: MCP_PORT,
    fetch: app.fetch,
};
