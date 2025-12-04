/*

CREATE TABLE document_chunks (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

*/

import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { documents } from "./documents";

export const documentChunks = pgTable("document_chunks", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    documentId: integer("document_id")
        .references(() => documents.id)
        .notNull(),
    chunkText: text("chunk_text").notNull(),
});

export type DocumentChunkInsert = typeof documentChunks.$inferInsert;
export type DocumentChunkSelect = typeof documentChunks.$inferSelect;
