import { QuackBinaryError, QuackRuntimeError } from "quack-search";
import type { ErrorDetails } from "../types/error.type";

export function buildErrorDetails(error: unknown): ErrorDetails {
    if (error instanceof QuackBinaryError) {
        return {
            type: "binary_error",
            message: error.message,
            code: error.code,
            details: error.hint,
        };
    }
    if (error instanceof QuackRuntimeError) {
        return {
            type: "runtime_error",
            message: error.message,
            code: error.code,
            details: error.details,
        };
    }
    if (error instanceof Error) {
        return {
            type: "unknown_error",
            message: error.message,
        };
    }
    return {
        type: "unknown_error",
        message: "Unknown error",
        details: String(error),
    };
}

export function isTransientError(error: unknown): boolean {
    if (error instanceof QuackRuntimeError) {
        return ["TIMEOUT", "PROCESS_FAILED", "CORE_ERROR"].includes(error.code);
    }
    return false;
}
