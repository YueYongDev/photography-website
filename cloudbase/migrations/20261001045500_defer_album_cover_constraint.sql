-- PostgreSQL's FK constraint trigger can run before our AFTER DELETE trigger.
-- Validate covers at transaction end, after the album trigger replaces/removes
-- every reference, while retaining full referential integrity on commit.
ALTER TABLE public.photo_site_city_sets
  ALTER CONSTRAINT photo_site_city_cover_fk DEFERRABLE INITIALLY DEFERRED;
