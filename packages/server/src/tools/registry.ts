import { FETCH_WEB_CONTENT_TOOL, WEB_SEARCH_TOOL } from "./definitions";
import { fetchWebContent } from "./functions/fetch-web-content";
import { performWebSearch } from "./functions/web-search";

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export const toolRegistry: Record<string, ToolHandler> = {
    [WEB_SEARCH_TOOL]: (args) =>
        performWebSearch(
            args.query as string,
            args.maxResults as number | undefined,
            args.timeoutMs as number | undefined,
        ),
    [FETCH_WEB_CONTENT_TOOL]: (args) =>
        fetchWebContent(args.url as string, args.timeoutMs as number | undefined),
};
