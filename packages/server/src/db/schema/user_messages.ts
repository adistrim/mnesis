import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const userMessages = pgTable("user_messages", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity().notNull(),
    sessionId: uuid("session_id")
        .notNull()
        .references(() => sessions.id, { onDelete: "cascade" }),
    tokens: integer("tokens").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserMessageInsert = typeof userMessages.$inferInsert;
export type UserMessageSelect = typeof userMessages.$inferSelect;
