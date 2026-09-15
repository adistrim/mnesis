import type { ErrorDetails } from "@/types/error.type";
import { QuackBinaryError, QuackRuntimeError } from "quack-search";

const TRANSIENT_QUACK_CODES = ["TIMEOUT", "PROCESS_FAILED", "CORE_ERROR"];

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

/** Transient quack-search failures are worth one retry. */
export function isTransientError(error: unknown): boolean {
    return (
        error instanceof QuackRuntimeError &&
        TRANSIENT_QUACK_CODES.includes(error.code)
    );
}
