import * as users from "./schema/users";
import * as photos from "./schema/photos";
import * as posts from "./schema/posts";
import { drizzle } from "drizzle-orm/pg-proxy";
import { drizzlePgQuery, executePgSql } from "./cloudbase-pg";

const schema = {
  ...users,
  ...photos,
  ...posts,
};

// Interactive transactions cannot span HTTPS requests. Multi-table photo changes
// are kept atomic by the versioned PostgreSQL triggers in cloudbase/migrations.
export const db = drizzle(drizzlePgQuery, { schema });

export async function checkDatabaseConnection() {
  await executePgSql("SELECT 1");
}
