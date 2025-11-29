import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const userMessages = pgTable("user_messages", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sessionId: uuid("session_id")
        .references(() => sessions.id)
        .notNull(),
    tokens: integer("tokens").notNull(),
    content: text("content").notNull(),
    createdAt: date("created_at").defaultNow(),
});

export type UserMessageInsert = typeof userMessages.$inferInsert;
export type UserMessageSelect = typeof userMessages.$inferSelect;
