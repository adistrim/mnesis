/*

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow(),
});

export type SessionInsert = typeof sessions.$inferInsert;
export type SessionSelect = typeof sessions.$inferSelect;
