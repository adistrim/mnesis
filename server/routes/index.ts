import { getMessageSchema } from "./v1/message";

export const routes = {
    "/v1/messages": getMessageSchema,
};
