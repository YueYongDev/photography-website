ALTER TABLE "sessions" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "sessions_token_unique";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");