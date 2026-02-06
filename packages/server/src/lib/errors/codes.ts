export const ErrorDefinitions = {
    INVALID_JSON:           { status: 400, message: "Invalid JSON body" },
    MISSING_FIELD:          { status: 400, message: "Missing required field" },
    INVALID_FIELD:          { status: 400, message: "Invalid field" },

    UNAUTHORIZED:           { status: 401, message: "Unauthorized" },
    FORBIDDEN:              { status: 403, message: "Forbidden" },

    SESSION_NOT_FOUND:      { status: 404, message: "Session not found" },
    RESOURCE_NOT_FOUND:     { status: 404, message: "Resource not found" },

    LLM_SERVICE_ERROR:      { status: 502, message: "LLM service error" },
    INVALID_LLM_RESPONSE:   { status: 502, message: "Invalid LLM response" },
    DATABASE_ERROR:         { status: 502, message: "Database error" },

    INTERNAL_ERROR:         { status: 500, message: "An unexpected error occurred" },
} as const;

export type ErrorCode = keyof typeof ErrorDefinitions;
export type ErrorStatus<C extends ErrorCode> = (typeof ErrorDefinitions)[C]["status"];
export type ErrorDefinition<C extends ErrorCode = ErrorCode> = (typeof ErrorDefinitions)[C];
