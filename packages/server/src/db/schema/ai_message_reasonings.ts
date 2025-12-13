import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { aiMessages } from "./ai_messages";

export const aiMessageReasoning = pgTable("ai_message_reasonings", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity().notNull(),
    messageId: integer("message_id")
        .notNull()
        .references(() => aiMessages.id, { onDelete: "cascade" }),
    tokens: integer("tokens").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiMessageReasoningInsert = typeof aiMessageReasoning.$inferInsert;
export type AiMessageReasoningSelect = typeof aiMessageReasoning.$inferSelect;
