-- HTTPS SQL calls cannot share a transaction. Maintain albums inside the same
-- PostgreSQL transaction as each photo mutation, including cover replacement.
CREATE FUNCTION public.photo_site_lock_albums() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('photo-site-city-sets', 0));
  RETURN NULL;
END;
$$;

CREATE FUNCTION public.photo_site_reconcile_place(p_country text, p_code text, p_city text)
RETURNS void LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  matching_ids varchar[];
  existing_cover varchar;
BEGIN
  IF nullif(trim(p_country), '') IS NULL OR nullif(trim(p_code), '') IS NULL
    OR nullif(trim(p_city), '') IS NULL THEN RETURN; END IF;
  p_country := trim(p_country);
  p_code := upper(trim(p_code));
  p_city := trim(p_city);
  SELECT array_agg(id ORDER BY updated_at DESC, id DESC) INTO matching_ids
  FROM public.photo_site_photos
  WHERE trim(country) = p_country AND upper(trim(country_code)) = p_code
    AND trim(CASE WHEN p_code IN ('JP', 'TW') THEN region ELSE city END) = p_city;

  IF coalesce(cardinality(matching_ids), 0) = 0 THEN
    DELETE FROM public.photo_site_city_sets WHERE country = p_country AND city = p_city;
    RETURN;
  END IF;
  SELECT cover_photo_id INTO existing_cover FROM public.photo_site_city_sets
    WHERE country = p_country AND city = p_city;
  INSERT INTO public.photo_site_city_sets
    (id, country, country_code, city, cover_photo_id, photo_count)
  VALUES (gen_random_uuid()::text, p_country, p_code, p_city,
    CASE WHEN existing_cover = ANY(matching_ids) THEN existing_cover ELSE matching_ids[1] END,
    cardinality(matching_ids))
  ON CONFLICT (country, city) DO UPDATE SET
    country_code = EXCLUDED.country_code,
    cover_photo_id = EXCLUDED.cover_photo_id,
    photo_count = EXCLUDED.photo_count,
    updated_at = timezone('UTC', clock_timestamp());
END;
$$;

CREATE FUNCTION public.photo_site_sync_photo_albums() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE affected record;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    -- Also repair legacy albums whose cover references a photo under an alias.
    FOR affected IN SELECT country, country_code, city FROM public.photo_site_city_sets
      WHERE cover_photo_id = OLD.id
    LOOP
      PERFORM public.photo_site_reconcile_place(affected.country, affected.country_code, affected.city);
    END LOOP;
    PERFORM public.photo_site_reconcile_place(OLD.country, OLD.country_code,
      CASE WHEN upper(trim(OLD.country_code)) IN ('JP', 'TW') THEN OLD.region ELSE OLD.city END);
  END IF;
  IF TG_OP <> 'DELETE' THEN
    PERFORM public.photo_site_reconcile_place(NEW.country, NEW.country_code,
      CASE WHEN upper(trim(NEW.country_code)) IN ('JP', 'TW') THEN NEW.region ELSE NEW.city END);
    RETURN NEW;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER photo_site_lock_albums_before_write
  BEFORE INSERT OR UPDATE OR DELETE ON public.photo_site_photos
  FOR EACH STATEMENT EXECUTE FUNCTION public.photo_site_lock_albums();
CREATE TRIGGER photo_site_sync_albums_after_write
  AFTER INSERT OR UPDATE OR DELETE ON public.photo_site_photos
  FOR EACH ROW EXECUTE FUNCTION public.photo_site_sync_photo_albums();

CREATE FUNCTION public.photo_site_reconcile_all_albums() RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE place record;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('photo-site-city-sets', 0));
  FOR place IN
    SELECT DISTINCT trim(country) AS country, upper(trim(country_code)) AS country_code,
      trim(CASE WHEN upper(trim(country_code)) IN ('JP', 'TW') THEN region ELSE city END) AS city
    FROM public.photo_site_photos
    UNION SELECT country, country_code, city FROM public.photo_site_city_sets
  LOOP
    PERFORM public.photo_site_reconcile_place(place.country, place.country_code, place.city);
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.photo_site_lock_albums() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.photo_site_reconcile_place(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.photo_site_sync_photo_albums() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.photo_site_reconcile_all_albums() FROM PUBLIC, anon, authenticated;
