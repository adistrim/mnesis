import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { aiMessages } from "./ai_messages";

export const aiMessageReasoning = pgTable("ai_message_reasonings", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    messageId: integer("message_id")
        .references(() => aiMessages.id)
        .notNull(),
    tokens: integer("tokens").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export type AiMessageReasoningInsert = typeof aiMessageReasoning.$inferInsert;
export type AiMessageReasoningSelect = typeof aiMessageReasoning.$inferSelect;
