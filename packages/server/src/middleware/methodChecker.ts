export type RouteHandler = (request: Request) => Response | Promise<Response>;

/**
 * Creates a route handler that only allows specified HTTP methods.
 * If the method is not allowed, it returns a 405 Method Not Allowed response.
 * @param allowedMethod The required HTTP method (e.g., 'POST', 'GET').
 * @param handler The original async route function to execute.
 * @returns A new handler function.
 */
export function requireMethod(allowedMethod: string, handler: RouteHandler): RouteHandler {
    return function(request: Request): Response | Promise<Response> {
        const requiredMethod = allowedMethod.toUpperCase();

        if (request.method !== requiredMethod) {
            return new Response(JSON.stringify({ error: `Method Not Allowed.` }), {
                status: 405,
                headers: { 
                    "Content-Type": "application/json",
                    "Allow": requiredMethod 
                },
            });
        }

        // Normalize both sync and async handlers
        return Promise.resolve(handler(request));
    };
}
