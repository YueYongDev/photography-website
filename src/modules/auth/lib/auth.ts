import { db } from "@/db/drizzle";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  /** if no database is provided, the user data will be stored in memory.
   * Make sure to provide a database to persist user data **/
});
