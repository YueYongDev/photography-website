import { InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  real,
  varchar,
  integer,
  uuid,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

export const photoVisibility = pgEnum("photo_visibility", [
  "public",
  "private",
]);

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    visibility: photoVisibility("visibility").default("private").notNull(),
    aspectRatio: real("aspect_ratio").notNull(),
    width: real("width").notNull(),
    height: real("height").notNull(),
    blurData: text("blur_data").notNull(),

    country: text("country"),
    countryCode: text("country_code"),
    region: text("region"),
    city: text("city"),
    district: text("district"),

    fullAddress: text("full_address"),
    placeFormatted: text("place_formatted"),

    make: varchar("make", { length: 255 }),
    model: varchar("model", { length: 255 }),
    lensModel: varchar("lens_model", { length: 255 }),
    focalLength: real("focal_length"),
    focalLength35mm: real("focal_length_35mm"),
    fNumber: real("f_number"),
    iso: integer("iso"),
    exposureTime: real("exposure_time"),
    exposureCompensation: real("exposure_compensation"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    gpsAltitude: real("gps_altitude"),
    dateTimeOriginal: timestamp("datetime_original"),

    ...timestamps,
  },
  (t) => [
    index("year_idx").on(sql`DATE_TRUNC('year', ${t.dateTimeOriginal})`),
    index("city_idx").on(t.city),
  ]
);

export const citySets = pgTable(
  "city_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    description: text("description"),
    country: text("country").notNull(),
    countryCode: text("country_code").notNull(),
    city: text("city").notNull(),
    coverPhotoId: uuid("cover_photo_id")
      .references(() => photos.id)
      .notNull(),
    photoCount: integer("photo_count").default(0).notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("unique_city_set").on(t.country, t.city)]
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

export const photosInsertSchema = createInsertSchema(photos).extend({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  focalLength: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  focalLength35mm: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  fNumber: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  iso: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  exposureTime: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  exposureCompensation: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  latitude: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  longitude: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val)
    ),
  dateTimeOriginal: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      return typeof val === "string" ? new Date(val) : val;
    }),
});

export const photosSelectSchema = createSelectSchema(photos);

export const photosUpdateSchema = createUpdateSchema(photos)
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
  })
  .partial()
  .extend({
    focalLength: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    focalLength35mm: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    fNumber: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    iso: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    exposureTime: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    exposureCompensation: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    latitude: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    longitude: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === "" || val === undefined ? undefined : Number(val)
      ),
    dateTimeOriginal: z
      .union([z.string(), z.date()])
      .optional()
      .transform((val) => {
        if (!val || val === "") return undefined;
        return typeof val === "string" ? new Date(val) : val;
      }),
  });

export type Photo = InferSelectModel<typeof photos>;
export type CitySet = InferSelectModel<typeof citySets>;
export type CitySetWithPhotos = CitySet & { photos: Photo[] } & {
  coverPhoto: Photo;
};
