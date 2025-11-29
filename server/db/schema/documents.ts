/*

CREATE TABLE documents (
  id INTEGER PRIMARY KEY,
  title TEXT,
  original_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

*/
import { date, integer, pgTable, text } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: text("title"),
    originalText: text("original_text").notNull(),
    createdAt: date("created_at").defaultNow(),
});

export type DocumentInsert = typeof documents.$inferInsert;
export type DocumentSelect = typeof documents.$inferSelect;
