-- CloudBase PG: schema copied from the live MySQL database on 2026-10-01.

-- Preserve IDs, UTC wall-clock timestamps, credentials, indexes and foreign keys.

-- Application access stays in the authenticated Next.js server.

CREATE TABLE "photo_site_user" (
  "id" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(320) NOT NULL,
  "email_verified" boolean NOT NULL,
  "image" text,
  "created_at" timestamp(3) without time zone NOT NULL,
  "updated_at" timestamp(3) without time zone NOT NULL,
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "photo_site_user_email_uq" ON "photo_site_user" ("email");

ALTER TABLE "photo_site_user" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_user" FROM anon, authenticated;

CREATE TABLE "photo_site_session" (
  "id" varchar(64) NOT NULL,
  "expires_at" timestamp(3) without time zone NOT NULL,
  "token" varchar(255) NOT NULL,
  "created_at" timestamp(3) without time zone NOT NULL,
  "updated_at" timestamp(3) without time zone NOT NULL,
  "ip_address" varchar(64) DEFAULT NULL,
  "user_agent" text,
  "user_id" varchar(64) NOT NULL,
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id"),
  CONSTRAINT "photo_site_session_user_fk" FOREIGN KEY ("user_id") REFERENCES "photo_site_user" ("id")
);

CREATE UNIQUE INDEX "photo_site_session_token_uq" ON "photo_site_session" ("token");

CREATE INDEX "photo_site_session_user_idx" ON "photo_site_session" ("user_id");

ALTER TABLE "photo_site_session" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_session" FROM anon, authenticated;

CREATE TABLE "photo_site_account" (
  "id" varchar(64) NOT NULL,
  "issuer" varchar(255) NOT NULL,
  "account_id" varchar(255) NOT NULL,
  "provider_id" varchar(255) NOT NULL,
  "user_id" varchar(64) NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp(3) without time zone DEFAULT NULL,
  "refresh_token_expires_at" timestamp(3) without time zone DEFAULT NULL,
  "scope" text,
  "password" text,
  "created_at" timestamp(3) without time zone NOT NULL,
  "updated_at" timestamp(3) without time zone NOT NULL,
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id"),
  CONSTRAINT "photo_site_account_user_fk" FOREIGN KEY ("user_id") REFERENCES "photo_site_user" ("id")
);

CREATE UNIQUE INDEX "photo_site_account_issuer_account_uq" ON "photo_site_account" ("issuer","account_id");

CREATE INDEX "photo_site_account_user_idx" ON "photo_site_account" ("user_id");

CREATE INDEX "photo_site_account_provider_idx" ON "photo_site_account" ("provider_id","account_id");

ALTER TABLE "photo_site_account" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_account" FROM anon, authenticated;

CREATE TABLE "photo_site_verification" (
  "id" varchar(64) NOT NULL,
  "identifier" varchar(320) NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp(3) without time zone NOT NULL,
  "created_at" timestamp(3) without time zone DEFAULT NULL,
  "updated_at" timestamp(3) without time zone DEFAULT NULL,
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id")
);

CREATE INDEX "photo_site_verification_identifier_idx" ON "photo_site_verification" ("identifier");

ALTER TABLE "photo_site_verification" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_verification" FROM anon, authenticated;

CREATE TABLE "photo_site_photos" (
  "id" varchar(36) NOT NULL,
  "url" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "is_favorite" boolean NOT NULL DEFAULT false,
  "visibility" text CHECK (visibility IN ('public', 'private')) NOT NULL DEFAULT 'private',
  "aspect_ratio" double precision NOT NULL,
  "width" double precision NOT NULL,
  "height" double precision NOT NULL,
  "blur_data" text NOT NULL,
  "country" varchar(128) DEFAULT NULL,
  "country_code" varchar(2) DEFAULT NULL,
  "region" varchar(128) DEFAULT NULL,
  "city" varchar(255) DEFAULT NULL,
  "district" varchar(255) DEFAULT NULL,
  "full_address" text,
  "place_formatted" text,
  "make" varchar(255) DEFAULT NULL,
  "model" varchar(255) DEFAULT NULL,
  "lens_model" varchar(255) DEFAULT NULL,
  "focal_length" double precision DEFAULT NULL,
  "focal_length_35mm" double precision DEFAULT NULL,
  "f_number" double precision DEFAULT NULL,
  "iso" int DEFAULT NULL,
  "exposure_time" double precision DEFAULT NULL,
  "exposure_compensation" double precision DEFAULT NULL,
  "latitude" double precision DEFAULT NULL,
  "longitude" double precision DEFAULT NULL,
  "gps_altitude" double precision DEFAULT NULL,
  "datetime_original" timestamp(3) without time zone DEFAULT NULL,
  "capture_timezone_offset" int NOT NULL DEFAULT '480',
  "created_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updated_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id")
);

CREATE INDEX "photo_site_photos_datetime_idx" ON "photo_site_photos" ("datetime_original");

CREATE INDEX "photo_site_photos_city_idx" ON "photo_site_photos" ("city");

CREATE INDEX "photo_site_photos_updated_idx" ON "photo_site_photos" ("updated_at");

CREATE INDEX "photo_site_photos_visibility_updated_idx" ON "photo_site_photos" ("visibility","updated_at");

ALTER TABLE "photo_site_photos" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_photos" FROM anon, authenticated;

CREATE TABLE "photo_site_city_sets" (
  "id" varchar(36) NOT NULL,
  "description" text,
  "country" varchar(128) NOT NULL,
  "country_code" varchar(2) NOT NULL,
  "city" varchar(255) NOT NULL,
  "cover_photo_id" varchar(36) NOT NULL,
  "photo_count" int NOT NULL DEFAULT '0',
  "created_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updated_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id"),
  CONSTRAINT "photo_site_city_cover_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "photo_site_photos" ("id")
);

CREATE UNIQUE INDEX "photo_site_city_country_city_uq" ON "photo_site_city_sets" ("country","city");

CREATE INDEX "photo_site_city_updated_idx" ON "photo_site_city_sets" ("updated_at");

CREATE INDEX "photo_site_city_cover_idx" ON "photo_site_city_sets" ("cover_photo_id");

ALTER TABLE "photo_site_city_sets" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_city_sets" FROM anon, authenticated;

CREATE TABLE "photo_site_categories" (
  "id" varchar(36) NOT NULL,
  "name" varchar(255) NOT NULL,
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id")
);

ALTER TABLE "photo_site_categories" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_categories" FROM anon, authenticated;

CREATE TABLE "photo_site_posts" (
  "id" varchar(36) NOT NULL,
  "title" text NOT NULL,
  "slug" varchar(255) NOT NULL,
  "category_id" varchar(36) DEFAULT NULL,
  "visibility" text CHECK (visibility IN ('public', 'private')) NOT NULL DEFAULT 'private',
  "tags" jsonb DEFAULT NULL,
  "cover_image" text,
  "description" text,
  "content" text,
  "reading_time_minutes" int DEFAULT NULL,
  "created_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "updated_at" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "_openid" varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY ("id"),
  CONSTRAINT "photo_site_posts_category_fk" FOREIGN KEY ("category_id") REFERENCES "photo_site_categories" ("id")
);

CREATE UNIQUE INDEX "photo_site_posts_slug_uq" ON "photo_site_posts" ("slug");

CREATE INDEX "photo_site_posts_category_idx" ON "photo_site_posts" ("category_id");

CREATE INDEX "photo_site_posts_updated_idx" ON "photo_site_posts" ("updated_at");

ALTER TABLE "photo_site_posts" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "photo_site_posts" FROM anon, authenticated;
