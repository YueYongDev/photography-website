import { InferSelectModel, sql } from "drizzle-orm";
import {
  timestamp,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const timestamps = {
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .notNull()
    .default(sql`timezone('UTC', CURRENT_TIMESTAMP(3))`),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .notNull()
    .default(sql`timezone('UTC', CURRENT_TIMESTAMP(3))`),
};

export const categories = pgTable("photo_site_categories", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  openId: varchar("_openid", { length: 64 }).notNull().default(""),
});

export const posts = pgTable(
  "photo_site_posts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    categoryId: varchar("category_id", { length: 36 }).references(
      () => categories.id
    ),
    visibility: text("visibility", { enum: ["public", "private"] })
      .default("private")
      .notNull(),
    tags: jsonb("tags").$type<string[] | null>(),
    coverImage: text("cover_image"),
    description: text("description"),
    content: text("content"),
    readingTimeMinutes: integer("reading_time_minutes"),
    ...timestamps,
    openId: varchar("_openid", { length: 64 }).notNull().default(""),
  },
  (table) => [
    index("category_idx").on(table.categoryId),
    uniqueIndex("slug_idx").on(table.slug),
    index("posts_updated_at_idx").on(table.updatedAt),
  ]
);

export type Post = InferSelectModel<typeof posts>;

export const postsInsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z.string(),
  categoryId: z.string().uuid().nullish(),
  visibility: z.enum(["public", "private"]).default("private"),
  tags: z.array(z.string()).nullish(),
  coverImage: z.string().nullish(),
  description: z.string().nullish(),
  content: z.string().nullish(),
  readingTimeMinutes: z.number().int().nonnegative().nullish(),
});

export const postsSelectSchema = postsInsertSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const postsUpdateSchema = postsInsertSchema.partial();
