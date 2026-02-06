import { ErrorDefinitions, type ErrorCode } from "./codes";
import {
    isAppError,
    makeAppError,
    type AppError,
    type AppErrorInput,
} from "./appError";

export type { AppError, AppErrorInput, ErrorCode };
export { ErrorDefinitions, isAppError, makeAppError };

export const invalidJsonError = (details?: unknown) =>
    makeAppError("INVALID_JSON", { details });

export const validationError = (message: string, details?: unknown) =>
    makeAppError("INVALID_FIELD", { message, details });

export const missingFieldError = (field: string) =>
    makeAppError("MISSING_FIELD", {
        message: `Missing required field: ${field}`,
        details: { field },
    });

export const unauthorizedError = (
    message: string = ErrorDefinitions.UNAUTHORIZED.message,
) =>
    makeAppError("UNAUTHORIZED", { message });

export const forbiddenError = (
    message: string = ErrorDefinitions.FORBIDDEN.message,
) =>
    makeAppError("FORBIDDEN", { message });

export const sessionNotFoundError = (sessionId: string) =>
    makeAppError("SESSION_NOT_FOUND", {
        message: ErrorDefinitions.SESSION_NOT_FOUND.message,
        details: { sessionId },
    });

export const resourceNotFoundError = (resource?: string) =>
    makeAppError("RESOURCE_NOT_FOUND", {
        message: resource
            ? `${resource} not found`
            : ErrorDefinitions.RESOURCE_NOT_FOUND.message,
    });

export const llmServiceError = (
    message: string = ErrorDefinitions.LLM_SERVICE_ERROR.message,
    details?: unknown,
) => makeAppError("LLM_SERVICE_ERROR", { message, details });

export const invalidLLMResponseError = (details?: unknown) =>
    makeAppError("INVALID_LLM_RESPONSE", { details });

export const databaseError = (
    message: string = ErrorDefinitions.DATABASE_ERROR.message,
    details?: unknown,
) => makeAppError("DATABASE_ERROR", { message, details });

export const internalError = (details?: unknown) =>
    makeAppError("INTERNAL_ERROR", { details });
