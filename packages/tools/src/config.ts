function parseIntEnv(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) {
        return fallback;
    }
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) ? value : fallback;
}

export const MCP_PORT = process.env.MCP_PORT || 3000;
export const DB_PATH = process.env.DB_PATH || "logs.db";

export const WEB_SEARCH_TIMEOUT_MS = parseIntEnv("WEB_SEARCH_TIMEOUT_MS", 30000);
export const FETCH_TIMEOUT_MS = parseIntEnv("FETCH_TIMEOUT_MS", 30000);
export const WEB_SEARCH_MAX_RESULTS_DEFAULT = parseIntEnv(
    "WEB_SEARCH_MAX_RESULTS_DEFAULT",
    10,
);
export const WEB_SEARCH_MAX_RESULTS_MAX = parseIntEnv(
    "WEB_SEARCH_MAX_RESULTS_MAX",
    10,
);
