import { Hono } from "hono";
import { chatRoute } from "./chat/chat.route";
import { messageRoute } from "./message/message.route";
import { sessionRoute } from "./session/session.route";

type VersionRoute = {
    path: string;
    router: Hono;
};

const v1RouteManifest: VersionRoute[] = [
    { path: "/chat", router: chatRoute },
    { path: "/message", router: messageRoute },
    { path: "/session", router: sessionRoute },
];

export const v1Routes = new Hono();

v1Routes.get("/", (ctx) => ctx.text("Welcome to the Mnesis API v1"));

for (const route of v1RouteManifest) {
    v1Routes.route(route.path, route.router);
}

export { chatRoute, messageRoute, sessionRoute, v1RouteManifest };
