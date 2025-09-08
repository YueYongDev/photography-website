import * as users from "./schema/users";
import * as photos from "./schema/photos";
import * as posts from "./schema/posts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const schema = {
  ...users,
  ...photos,
  ...posts,
};

// 创建 PostgreSQL 连接
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });
