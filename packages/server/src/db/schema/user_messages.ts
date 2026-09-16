import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const userMessages = pgTable("user_messages", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity().notNull(),
    sessionId: uuid("session_id")
        .notNull()
        .references(() => sessions.id, { onDelete: "cascade" }),
    tokens: integer("tokens").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    // every turn replays the session; without this the union is a sequential scan
    index("user_messages_session_created_idx").on(
        table.sessionId,
        table.createdAt,
        table.id,
    ),
]);

export type UserMessageInsert = typeof userMessages.$inferInsert;
export type UserMessageSelect = typeof userMessages.$inferSelect;
