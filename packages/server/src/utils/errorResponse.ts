import { ErrorDefinitions, internalError, isAppError, type AppError } from "@/lib/errors";

type ErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

const INTERNAL_ERROR = internalError();

function toPayload(error: AppError): ErrorPayload {
    return {
        error: {
            code: error.code,
            message: error.message,
            ...(error.details !== undefined && { details: error.details }),
        },
    };
}

export function errorResponse(error: unknown): Response {
    if (isAppError(error)) {
        return Response.json(toPayload(error), {
            status: ErrorDefinitions[error.code].status,
        });
    }

    console.error("Unexpected error:", error);

    return Response.json(toPayload(INTERNAL_ERROR), {
        status: ErrorDefinitions.INTERNAL_ERROR.status,
    });
}
