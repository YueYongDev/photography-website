import {
  boolean,
  datetime,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

const authId = (name: string) => varchar(name, { length: 64 });
const authTimestamp = (name: string) =>
  datetime(name, { mode: "date", fsp: 3 });

export const user = mysqlTable("photo_site_user", {
  id: authId("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: authTimestamp("created_at").notNull(),
  updatedAt: authTimestamp("updated_at").notNull(),
  openId: varchar("_openid", { length: 64 }).notNull().default(""),
});

export const session = mysqlTable("photo_site_session", {
  id: authId("id").primaryKey(),
  expiresAt: authTimestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: authTimestamp("created_at").notNull(),
  updatedAt: authTimestamp("updated_at").notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  userId: authId("user_id")
    .notNull()
    .references(() => user.id),
  openId: varchar("_openid", { length: 64 }).notNull().default(""),
});

export const account = mysqlTable("photo_site_account", {
  id: authId("id").primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: authId("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: authTimestamp("access_token_expires_at"),
  refreshTokenExpiresAt: authTimestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: authTimestamp("created_at").notNull(),
  updatedAt: authTimestamp("updated_at").notNull(),
  openId: varchar("_openid", { length: 64 }).notNull().default(""),
});

export const verification = mysqlTable("photo_site_verification", {
  id: authId("id").primaryKey(),
  identifier: varchar("identifier", { length: 320 }).notNull(),
  value: text("value").notNull(),
  expiresAt: authTimestamp("expires_at").notNull(),
  createdAt: authTimestamp("created_at"),
  updatedAt: authTimestamp("updated_at"),
  openId: varchar("_openid", { length: 64 }).notNull().default(""),
});
