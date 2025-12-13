/*

CREATE TABLE chunk_embeddings (
  chunk_id INTEGER PRIMARY KEY,
  embedding VECTOR(1024),
  FOREIGN KEY (chunk_id) REFERENCES document_chunks(id)
);

*/

import { integer, vector } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";
import { documentChunks } from "./document_chunks";

export const documentChunkEmbeddings = pgTable("document_chunk_embeddings", {
    chunkId: integer("chunk_id").references(() => documentChunks.id, { onDelete: "cascade" }).primaryKey().notNull(),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
});

export type DocumentChunkEmbeddingsInsert = typeof documentChunkEmbeddings.$inferInsert;
export type DocumentChunkEmbeddingsSelect = typeof documentChunkEmbeddings.$inferSelect;
