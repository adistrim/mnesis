import { chatRoute, messageRoute, sessionRoute } from "./v1";
import { Hono } from "hono";

export const v1Routes = new Hono();

v1Routes.get('/', ctx => ctx.text('Welcome to the Mnesis API v1'))

v1Routes.route('/chat', chatRoute);
v1Routes.route('/message', messageRoute);
v1Routes.route('/session', sessionRoute);
