import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const aiMessages = pgTable("ai_messages", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity().notNull(),
    sessionId: uuid("session_id")
        .references(() => sessions.id)
        .notNull(),
    model: text("model").notNull(),
    tokens: integer("tokens").notNull(),
    reasoning: boolean("reasoning").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiMessageInsert = typeof aiMessages.$inferInsert;
export type AiMessageSelect = typeof aiMessages.$inferSelect;
