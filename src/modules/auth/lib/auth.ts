import { db } from "@/db/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";
import { cache } from "react";

const trustedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  "https://p.yueyong.fun",
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Signed session data avoids a database round trip on every protected
    // navigation while keeping the database-backed session as the source of truth.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },
  /** if no database is provided, the user data will be stored in memory.
   * Make sure to provide a database to persist user data **/
});

/**
 * React's request cache makes the layout, page and server-side tRPC prefetch
 * share one Better Auth lookup during the same render.
 */
export const getCurrentSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
  })
);
