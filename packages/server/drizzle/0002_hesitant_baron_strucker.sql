ALTER TABLE "ai_message_reasonings" DROP CONSTRAINT "ai_message_reasonings_message_id_ai_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_messages" DROP CONSTRAINT "ai_messages_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "document_chunk_embeddings" DROP CONSTRAINT "document_chunk_embeddings_chunk_id_document_chunks_id_fk";
--> statement-breakpoint
ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "user_messages" DROP CONSTRAINT "user_messages_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_message_reasonings" ADD CONSTRAINT "ai_message_reasonings_message_id_ai_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ai_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunk_embeddings" ADD CONSTRAINT "document_chunk_embeddings_chunk_id_document_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."document_chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;