import { ErrorDefinitions, type ErrorCode } from "./codes";

export type AppError<C extends ErrorCode = ErrorCode> = {
    code: C;
    message: string;
    details?: unknown;
};

export type AppErrorInput = {
    message?: string;
    details?: unknown;
};

export function makeAppError<C extends ErrorCode>(
    code: C,
    input: AppErrorInput = {},
): AppError<C> {
    const def = ErrorDefinitions[code];
    const message = input.message ?? def.message;
    const error: AppError<C> = { code, message };

    if (input.details !== undefined) {
        error.details = input.details;
    }

    return error;
}

export function isAppError(value: unknown): value is AppError {
    if (!value || typeof value !== "object") return false;
    const code = (value as { code?: unknown }).code;
    return typeof code === "string" && code in ErrorDefinitions;
}
