import { AppError } from "@/lib/errors";

export function errorResponse(error: unknown): Response {
    if (error instanceof AppError) {
        const payload: {
            error: { code: string; message: string; details?: unknown };
        } = {
            error: {
                code: error.code,
                message: error.message,
            },
        };

        if (error.details !== undefined) {
            payload.error.details = error.details;
        }

        return new Response(JSON.stringify(payload), {
            status: error.statusCode,
            headers: { "Content-Type": "application/json" },
        });
    }

    console.error("Unexpected error:", error);

    return new Response(
        JSON.stringify({
            error: {
                code: "INTERNAL_ERROR",
                message: "An unexpected error occurred",
            },
        }),
        {
            status: 500,
            headers: { "Content-Type": "application/json" },
        },
    );
}
