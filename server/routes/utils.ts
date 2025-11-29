import type { RouteHandler } from "@/middleware/methodChecker";

export function withPrefix<Handlers extends Record<string, RouteHandler>>(
    prefix: string,
    routes: Handlers
): Record<string, Handlers[keyof Handlers]> {
    const out = {} as Record<string, Handlers[keyof Handlers]>;

    for (const path in routes) {
        const fullPath = path === "/" ? prefix : prefix + path;
        out[fullPath] = routes[path];
    }

    return out;
}
