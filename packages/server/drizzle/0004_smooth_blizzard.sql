DROP TABLE "session_memory" CASCADE;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "citations" jsonb;