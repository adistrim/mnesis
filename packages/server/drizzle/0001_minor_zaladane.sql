ALTER TABLE "ai_message_reasonings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_chunk_embeddings" ALTER COLUMN "embedding" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_messages" ALTER COLUMN "created_at" SET NOT NULL;