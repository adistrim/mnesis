-- session_memory is restructured from one blob per session into append-only segments.
-- Safe to recreate: the table was unused scaffolding and verified empty (0 rows).
DROP TABLE IF EXISTS "session_memory";--> statement-breakpoint
CREATE TABLE "session_memory" (
	"session_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"from_user_message_id" integer NOT NULL,
	"through_user_message_id" integer NOT NULL,
	"content" text NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_memory_session_id_seq_pk" PRIMARY KEY("session_id","seq")
);--> statement-breakpoint
ALTER TABLE "session_memory" ADD CONSTRAINT "session_memory_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_memory_session_seq_idx" ON "session_memory" USING btree ("session_id","seq");
