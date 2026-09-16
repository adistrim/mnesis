import {
    index,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

/**
 * Rolling context memory, one row per compacted span. Segments are append-only and never
 * re-summarised: each source exchange is summarised exactly once, so fidelity cannot
 * degrade across compactions. Rendering each segment as its own message also keeps the
 * prompt prefix append-only, so a new segment does not invalidate earlier cache units.
 */
export const sessionMemory = pgTable(
    "session_memory",
    {
        sessionId: uuid("session_id")
            .notNull()
            .references(() => sessions.id, { onDelete: "cascade" }),
        seq: integer("seq").notNull(),
        fromUserMessageId: integer("from_user_message_id").notNull(),
        throughUserMessageId: integer("through_user_message_id").notNull(),
        content: text("content").notNull(),
        model: text("model").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.sessionId, table.seq] }),
        index("session_memory_session_seq_idx").on(table.sessionId, table.seq),
    ],
);

export type SessionMemoryInsert = typeof sessionMemory.$inferInsert;
export type SessionMemorySelect = typeof sessionMemory.$inferSelect;
