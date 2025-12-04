export { AppError } from "./appError";
export { ErrorCodes } from "./codes";
import { AppError } from "./appError";
import { ErrorCodes } from "./codes";

// 400 - Bad Request
export function validationError(message: string, details?: unknown) {
    return new AppError(400, ErrorCodes.INVALID_FIELD, message, details);
}

export function invalidJsonError() {
    return new AppError(400, ErrorCodes.INVALID_JSON, "Invalid JSON body");
}

export function missingFieldError(field: string) {
    return new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        `Missing required field: ${field}`,
    );
}

// 404 - Not Found
export function sessionNotFoundError(sessionId: string) {
    return new AppError(
        404,
        ErrorCodes.SESSION_NOT_FOUND,
        "Session not found",
        { sessionId },
    );
}

export function notFoundError(resource: string) {
    return new AppError(
        404,
        ErrorCodes.RESOURCE_NOT_FOUND,
        `${resource} not found`,
    );
}

// 502 - Bad Gateway (external service issues)
export function llmServiceError(message: string = "LLM service unavailable") {
    return new AppError(502, ErrorCodes.LLM_SERVICE_ERROR, message);
}

export function invalidLLMResponseError() {
    return new AppError(
        502,
        ErrorCodes.INVALID_LLM_RESPONSE,
        "LLM returned invalid response",
    );
}

export function databaseError(message: string = "Database operation failed") {
    return new AppError(502, ErrorCodes.DATABASE_ERROR, message);
}

// 500 - Internal Server Error
export function internalError(message: string = "Internal server error") {
    return new AppError(500, ErrorCodes.INTERNAL_ERROR, message);
}
