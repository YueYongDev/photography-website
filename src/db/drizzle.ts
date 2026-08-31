import * as users from "./schema/users";
import * as photos from "./schema/photos";
import * as posts from "./schema/posts";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const schema = {
  ...users,
  ...photos,
  ...posts,
};

const runtimeDatabaseUrl = process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error("DATABASE_URL must be configured");
}

const pool = mysql.createPool({
  uri: runtimeDatabaseUrl,
  connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 4),
  connectTimeout: 4_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 2,
  idleTimeout: 30_000,
  queueLimit: 20,
  timezone: "Z",
  waitForConnections: true,
});

export const db = drizzle(pool, { schema, mode: "default" });

export async function checkDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
  } finally {
    connection.release();
  }
}
