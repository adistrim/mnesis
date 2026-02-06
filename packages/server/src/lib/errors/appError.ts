import { ErrorDefinitions, type ErrorCode } from "./codes";

const APP_ERROR_BRAND = Symbol("APP_ERROR_BRAND");

export type AppError<C extends ErrorCode = ErrorCode> = {
    [APP_ERROR_BRAND]: true;
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
    const error: AppError<C> = {
        [APP_ERROR_BRAND]: true,
        code,
        message,
    };

    if (input.details !== undefined) {
        error.details = input.details;
    }

    return error;
}

export function isAppError(value: unknown): value is AppError {
    if (!value || typeof value !== "object") return false;

    const candidate = value as {
        [APP_ERROR_BRAND]?: unknown;
        code?: unknown;
        message?: unknown;
    };

    if (candidate[APP_ERROR_BRAND] !== true) return false;
    if (typeof candidate.code !== "string") return false;
    if (!(candidate.code in ErrorDefinitions)) return false;
    if (typeof candidate.message !== "string") return false;

    return true;
}
