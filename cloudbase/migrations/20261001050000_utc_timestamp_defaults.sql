-- CloudBase SQL sessions default to PRC. The application encodes and decodes
-- timestamp-without-time-zone values as UTC; make generated values match.
ALTER TABLE public.photo_site_photos
  ALTER COLUMN created_at SET DEFAULT timezone('UTC', CURRENT_TIMESTAMP(3)),
  ALTER COLUMN updated_at SET DEFAULT timezone('UTC', CURRENT_TIMESTAMP(3));
ALTER TABLE public.photo_site_city_sets
  ALTER COLUMN created_at SET DEFAULT timezone('UTC', CURRENT_TIMESTAMP(3)),
  ALTER COLUMN updated_at SET DEFAULT timezone('UTC', CURRENT_TIMESTAMP(3));
ALTER TABLE public.photo_site_posts
  ALTER COLUMN created_at SET DEFAULT timezone('UTC', CURRENT_TIMESTAMP(3)),
  ALTER COLUMN updated_at SET DEFAULT timezone('UTC', CURRENT_TIMESTAMP(3));
