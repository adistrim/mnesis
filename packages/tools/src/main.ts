import app, { logger, SERVER_NAME, SERVER_VERSION } from "./server";

const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3001;

logger.info("MCP Tools Server starting", {
    server: SERVER_NAME,
    version: SERVER_VERSION,
    port: PORT,
});

console.log(`Starting MCP Tools Server on port ${PORT}`);
console.log(`Health check: http://localhost:${PORT}/health`);
console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);

export default {
    port: PORT,
    fetch: app.fetch,
};
