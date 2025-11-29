import {
    boolean,
    date,
    integer,
    pgTable,
    serial,
    text,
    uuid,
} from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const aiMessages = pgTable("ai_messages", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sessionId: uuid("session_id")
        .references(() => sessions.id)
        .notNull(),
    model: text("model").notNull(),
    tokens: integer("tokens").notNull(),
    reasoning: boolean("reasoning").notNull(),
    content: text("content").notNull(),
    createdAt: date("created_at").defaultNow(),
});

export type AiMessageInsert = typeof aiMessages.$inferInsert;
export type AiMessageSelect = typeof aiMessages.$inferSelect;
