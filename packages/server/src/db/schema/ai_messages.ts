import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { sessions } from "./sessions";
import type { SourceRef } from "@/tools/sources";

export const aiMessages = pgTable("ai_messages", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity().notNull(),
    sessionId: uuid("session_id")
        .notNull()
        .references(() => sessions.id, { onDelete: "cascade" }),
    model: text("model").notNull(),
    tokens: integer("tokens").notNull(),
    reasoning: boolean("reasoning").notNull(),
    content: text("content").notNull(),
    citations: jsonb("citations").$type<SourceRef[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiMessageInsert = typeof aiMessages.$inferInsert;
export type AiMessageSelect = typeof aiMessages.$inferSelect;
