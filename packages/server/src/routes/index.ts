import { requireMethod } from "@/middleware/methodChecker";
import { withPrefix } from "./utils";
import { chatRoutes } from "./v1/chat/chat";
import { messageRoutes } from "./v1/message";

function rootRoute() {
    return new Response("Welcome to the API v1", {
        headers: { "Content-Type": "text/plain" },
    });
}

export const v1Routes = withPrefix("/api/v1", {
    "/": requireMethod("GET", rootRoute),
    ...chatRoutes,
    ...messageRoutes,
});
