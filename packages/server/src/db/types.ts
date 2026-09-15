import type { SourceRef } from "@/tools/sources";
import type {
    AiMessageInsert,
    AiMessageSelect,
    SessionSelect,
    UserMessageInsert,
    UserMessageSelect,
} from "@/db/schema";

export type SaveUserMessageInput = Pick<
    UserMessageInsert,
    "sessionId" | "content" | "tokens"
>;

export type SaveAIMessageInput = {
    sessionId: AiMessageInsert["sessionId"];
    model: AiMessageInsert["model"];
    content: AiMessageInsert["content"];
    responseTokens: AiMessageInsert["tokens"];
    reasoningTokens?: number;
    reasoningContent?: string | null;
    citations?: SourceRef[];
};

export type SaveExchangeInput = {
    sessionId: SessionSelect["id"];
    user: {
        content: UserMessageInsert["content"];
        tokens: UserMessageInsert["tokens"];
    };
    ai: {
        model: AiMessageInsert["model"];
        content: AiMessageInsert["content"];
        responseTokens: AiMessageInsert["tokens"];
        reasoningTokens?: number;
        reasoningContent?: string | null;
        citations?: SourceRef[];
    };
};

export type SessionSummary = Pick<SessionSelect, "id" | "title"> & {
    createdAt: string;
};

export type SessionHistoryRole = "user" | "assistant";

export type SessionHistoryRow = {
    id: number;
    content: string;
    createdAt: string;
    role: SessionHistoryRole;
    reasoning: string | null;
    citations: SourceRef[] | string | null;
};

export type SessionExchange = {
    user: {
        id: UserMessageSelect["id"];
        content: UserMessageSelect["content"];
    };
    ai?: {
        id: AiMessageSelect["id"];
        content: AiMessageSelect["content"];
        reasoning: string | null;
        citations: SourceRef[];
    };
};

export type RecentAiMessage = Pick<
    AiMessageSelect,
    "id" | "sessionId" | "model" | "tokens" | "reasoning" | "content"
> & {
    createdAt: string;
};
