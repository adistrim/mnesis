function requireEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set.`);
    }
    return value;
}

/**
 * Parse allowed origins from environment variable.
 * Supports comma-separated values or single value.
 * In development, defaults to allowing localhost origins.
 */
function getAllowedOrigins(): string[] {
    const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
    
    if (envOrigins) {
        return envOrigins.split(',').map(origin => origin.trim()).filter(Boolean);
    }
    
    const isDevelopment = requireEnvVar("ENV") !== 'prod';
    if (isDevelopment) {
        return [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:80',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:80',
        ];
    }
    
    return [];
}

export const settings = {
    get PORT() { return process.env.PORT || 3000; },
    get HOST() { return process.env.HOST || "http://localhost"; },
    get DB_URL() { return requireEnvVar("DB_URL"); },
    get LLM_HOST_API() { return requireEnvVar("LLM_HOST_API"); },
    get LLM_HOST() { return requireEnvVar("LLM_HOST"); },
    get MCP_TOOLS_URL() { return process.env.MCP_TOOLS_URL || "http://localhost:3001"; },
    get CORS_ALLOWED_ORIGINS() { return getAllowedOrigins(); },
};
