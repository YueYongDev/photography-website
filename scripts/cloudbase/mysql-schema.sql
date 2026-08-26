CREATE TABLE photo_site_user (
  id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  email_verified BOOLEAN NOT NULL,
  image TEXT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY photo_site_user_email_uq (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE photo_site_account (
  id VARCHAR(64) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  access_token TEXT NULL,
  refresh_token TEXT NULL,
  id_token TEXT NULL,
  access_token_expires_at DATETIME(3) NULL,
  refresh_token_expires_at DATETIME(3) NULL,
  scope TEXT NULL,
  password TEXT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY photo_site_account_issuer_account_uq (issuer, account_id),
  KEY photo_site_account_user_idx (user_id),
  KEY photo_site_account_provider_idx (provider_id, account_id),
  CONSTRAINT photo_site_account_user_fk
    FOREIGN KEY (user_id) REFERENCES photo_site_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE photo_site_session (
  id VARCHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent TEXT NULL,
  user_id VARCHAR(64) NOT NULL,
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY photo_site_session_token_uq (token),
  KEY photo_site_session_user_idx (user_id),
  CONSTRAINT photo_site_session_user_fk
    FOREIGN KEY (user_id) REFERENCES photo_site_user (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE photo_site_verification (
  id VARCHAR(64) NOT NULL,
  identifier VARCHAR(320) NOT NULL,
  value TEXT NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY photo_site_verification_identifier_idx (identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE photo_site_photos (
  id VARCHAR(36) NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  visibility ENUM('public', 'private') NOT NULL DEFAULT 'private',
  aspect_ratio DOUBLE NOT NULL,
  width DOUBLE NOT NULL,
  height DOUBLE NOT NULL,
  blur_data TEXT NOT NULL,
  country VARCHAR(128) NULL,
  country_code VARCHAR(2) NULL,
  region VARCHAR(128) NULL,
  city VARCHAR(255) NULL,
  district VARCHAR(255) NULL,
  full_address TEXT NULL,
  place_formatted TEXT NULL,
  make VARCHAR(255) NULL,
  model VARCHAR(255) NULL,
  lens_model VARCHAR(255) NULL,
  focal_length DOUBLE NULL,
  focal_length_35mm DOUBLE NULL,
  f_number DOUBLE NULL,
  iso INT NULL,
  exposure_time DOUBLE NULL,
  exposure_compensation DOUBLE NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  gps_altitude DOUBLE NULL,
  datetime_original DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY photo_site_photos_datetime_idx (datetime_original),
  KEY photo_site_photos_city_idx (city),
  KEY photo_site_photos_updated_idx (updated_at),
  KEY photo_site_photos_visibility_updated_idx (visibility, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE photo_site_city_sets (
  id VARCHAR(36) NOT NULL,
  description TEXT NULL,
  country VARCHAR(128) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  city VARCHAR(255) NOT NULL,
  cover_photo_id VARCHAR(36) NOT NULL,
  photo_count INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY photo_site_city_country_city_uq (country, city),
  KEY photo_site_city_updated_idx (updated_at),
  KEY photo_site_city_cover_idx (cover_photo_id),
  CONSTRAINT photo_site_city_cover_fk
    FOREIGN KEY (cover_photo_id) REFERENCES photo_site_photos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE photo_site_categories (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE photo_site_posts (
  id VARCHAR(36) NOT NULL,
  title TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  category_id VARCHAR(36) NULL,
  visibility ENUM('public', 'private') NOT NULL DEFAULT 'private',
  tags JSON NULL,
  cover_image TEXT NULL,
  description TEXT NULL,
  content TEXT NULL,
  reading_time_minutes INT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  _openid VARCHAR(64) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  UNIQUE KEY photo_site_posts_slug_uq (slug),
  KEY photo_site_posts_category_idx (category_id),
  KEY photo_site_posts_updated_idx (updated_at),
  CONSTRAINT photo_site_posts_category_fk
    FOREIGN KEY (category_id) REFERENCES photo_site_categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
