/* 

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL,
  role TEXT NOT NULL,          -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

POSTGRESQL!

*/

import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const messages = pgTable("messages", {
    id: integer("id").primaryKey(),
    sessionId: uuid("session_id").references(() => sessions.id).notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: date("created_at").defaultNow(),
})

export type MessageInsert = typeof messages.$inferInsert;
export type MessageSelect = typeof messages.$inferSelect;
