import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/pg-migrations",
  dialect: "postgresql",
  // Schema generation only. The shared PG cluster has no TCP endpoint;
  // reviewed SQL is applied through CloudBase's versioned migrations.
  verbose: true,
  strict: true,
});
