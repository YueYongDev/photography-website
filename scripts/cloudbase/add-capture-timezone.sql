ALTER TABLE photo_site_photos
  ADD COLUMN capture_timezone_offset INT NOT NULL DEFAULT 480
  AFTER datetime_original;
