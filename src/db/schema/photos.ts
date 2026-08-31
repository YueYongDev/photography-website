import { InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  double,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { z } from "zod";

export const timestamps = {
  createdAt: datetime("created_at", { mode: "date", fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime("updated_at", { mode: "date", fsp: 3 })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
};

export const photos = mysqlTable(
  "photo_site_photos",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    visibility: mysqlEnum("visibility", ["public", "private"])
      .default("private")
      .notNull(),
    aspectRatio: double("aspect_ratio").notNull(),
    width: double("width").notNull(),
    height: double("height").notNull(),
    blurData: text("blur_data").notNull(),

    country: varchar("country", { length: 128 }),
    countryCode: varchar("country_code", { length: 2 }),
    region: varchar("region", { length: 128 }),
    city: varchar("city", { length: 255 }),
    district: varchar("district", { length: 255 }),

    fullAddress: text("full_address"),
    placeFormatted: text("place_formatted"),

    make: varchar("make", { length: 255 }),
    model: varchar("model", { length: 255 }),
    lensModel: varchar("lens_model", { length: 255 }),
    focalLength: double("focal_length"),
    focalLength35mm: double("focal_length_35mm"),
    fNumber: double("f_number"),
    iso: int("iso"),
    exposureTime: double("exposure_time"),
    exposureCompensation: double("exposure_compensation"),
    latitude: double("latitude"),
    longitude: double("longitude"),
    gpsAltitude: double("gps_altitude"),
    dateTimeOriginal: datetime("datetime_original", {
      mode: "date",
      fsp: 3,
    }),

    ...timestamps,
    openId: varchar("_openid", { length: 64 }).notNull().default(""),
  },
  (t) => [
    index("datetime_original_idx").on(t.dateTimeOriginal),
    index("city_idx").on(t.city),
    index("photos_updated_at_idx").on(t.updatedAt),
  ]
);

export const citySets = mysqlTable(
  "photo_site_city_sets",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    description: text("description"),
    country: varchar("country", { length: 128 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    coverPhotoId: varchar("cover_photo_id", { length: 36 })
      .references(() => photos.id)
      .notNull(),
    photoCount: int("photo_count").default(0).notNull(),
    ...timestamps,
    openId: varchar("_openid", { length: 64 }).notNull().default(""),
  },
  (t) => [
    uniqueIndex("unique_city_set").on(t.country, t.city),
    index("city_sets_updated_at_idx").on(t.updatedAt),
  ]
);

export const citySetsRelations = relations(citySets, ({ one, many }) => ({
  coverPhoto: one(photos, {
    fields: [citySets.coverPhotoId],
    references: [photos.id],
  }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  citySet: one(citySets, {
    fields: [photos.country, photos.city],
    references: [citySets.country, citySets.city],
  }),
}));

const optionalNumber = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((value, context) => {
    if (value === null) return null;
    if (value === "" || value === undefined) return undefined;
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      context.addIssue({
        code: "custom",
        message: "Use a finite number",
      });
      return z.NEVER;
    }

    return parsedValue;
  });

const optionalCameraNumber = ({
  integer = false,
  maximum,
  minimum,
  message,
}: {
  integer?: boolean;
  maximum: number;
  minimum: number;
  message: string;
}) =>
  optionalNumber.refine(
    (value) =>
      value === null ||
      value === undefined ||
      (value >= minimum &&
        value <= maximum &&
        (!integer || Number.isInteger(value))),
    { message },
  );

const optionalDate = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((value, context) => {
    if (value === null) return null;
    if (!value || value === "") return undefined;
    const date = typeof value === "string" ? new Date(value) : value;

    if (!Number.isFinite(date.getTime())) {
      context.addIssue({ code: "custom", message: "Use a valid date" });
      return z.NEVER;
    }

    return date;
  });

export const photosInsertSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().min(1),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  isFavorite: z.boolean().default(false),
  visibility: z.enum(["public", "private"]).default("private"),
  aspectRatio: z.number(),
  width: z.number(),
  height: z.number(),
  blurData: z.string(),
  country: z.string().nullish(),
  countryCode: z.string().max(2).nullish(),
  region: z.string().nullish(),
  city: z.string().nullish(),
  district: z.string().nullish(),
  fullAddress: z.string().nullish(),
  placeFormatted: z.string().nullish(),
  make: z.string().nullish(),
  model: z.string().nullish(),
  lensModel: z.string().nullish(),
  focalLength: optionalCameraNumber({
    minimum: 0.001,
    maximum: 100000,
    message: "Focal length must be between 0.001 and 100000 mm",
  }),
  focalLength35mm: optionalCameraNumber({
    minimum: 0.001,
    maximum: 100000,
    message: "35 mm equivalent focal length must be positive",
  }),
  fNumber: optionalCameraNumber({
    minimum: 0.1,
    maximum: 256,
    message: "Aperture must be between f/0.1 and f/256",
  }),
  iso: optionalCameraNumber({
    minimum: 1,
    maximum: 10000000,
    integer: true,
    message: "ISO must be a positive whole number",
  }),
  exposureTime: optionalCameraNumber({
    minimum: 0.000000001,
    maximum: 86400,
    message: "Shutter time must be positive and no longer than 24 hours",
  }),
  exposureCompensation: optionalCameraNumber({
    minimum: -100,
    maximum: 100,
    message: "Exposure compensation must be between -100 and +100 EV",
  }),
  latitude: optionalNumber,
  longitude: optionalNumber,
  gpsAltitude: optionalNumber,
  dateTimeOriginal: optionalDate,
});

export const photosSelectSchema = photosInsertSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const photosUpdateSchema = photosInsertSchema
  .pick({
    id: true,
    title: true,
    description: true,
    isFavorite: true,
    latitude: true,
    longitude: true,
    visibility: true,
    make: true,
    model: true,
    lensModel: true,
    focalLength: true,
    focalLength35mm: true,
    fNumber: true,
    iso: true,
    exposureTime: true,
    exposureCompensation: true,
    dateTimeOriginal: true,
    country: true,
    countryCode: true,
    region: true,
    city: true,
    district: true,
    fullAddress: true,
    placeFormatted: true,
    gpsAltitude: true,
  })
  .partial();

export type Photo = InferSelectModel<typeof photos>;
export type CitySet = InferSelectModel<typeof citySets>;
export type CitySetWithPhotos = CitySet & { photos: Photo[] } & {
  coverPhoto: Photo;
};
