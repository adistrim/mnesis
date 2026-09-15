import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const sessionMemory = pgTable("session_memory", {
    sessionId: uuid("session_id")
        .primaryKey()
        .notNull()
        .references(() => sessions.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SessionMemoryInsert = typeof sessionMemory.$inferInsert;
export type SessionMemorySelect = typeof sessionMemory.$inferSelect;
