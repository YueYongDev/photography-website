CREATE TYPE "public"."photo_visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "visibility" "photo_visibility" DEFAULT 'public' NOT NULL;