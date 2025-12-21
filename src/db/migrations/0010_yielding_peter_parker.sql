CREATE INDEX "city_sets_updated_at_idx" ON "city_sets" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "photos_updated_at_idx" ON "photos" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");