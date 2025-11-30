export const ErrorCodes = {
    // Validation errors (400)
    INVALID_JSON: "INVALID_JSON",
    MISSING_FIELD: "MISSING_FIELD",
    INVALID_FIELD: "INVALID_FIELD",

    // Authentication/Authorization (401/403)
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",

    // Not found (404)
    SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

    // External service failures (502)
    LLM_SERVICE_ERROR: "LLM_SERVICE_ERROR",
    INVALID_LLM_RESPONSE: "INVALID_LLM_RESPONSE",
    DATABASE_ERROR: "DATABASE_ERROR",

    // Internal errors (500)
    INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
