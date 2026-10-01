import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import mysql from "mysql2/promise";
import { config } from "dotenv";

config({ path: process.env.MIGRATION_ENV_FILE ?? ".env.local" });

const tables = ["user", "session", "account", "verification", "photos", "city_sets", "categories", "posts"].map((name) => `photo_site_${name}`);
const [command, snapshotPath, outputPath] = process.argv.slice(2);
if (!snapshotPath || !["export", "build-import", "verify"].includes(command)) {
  throw new Error("Usage: migrate-mysql-to-pg.mjs export|build-import|verify <snapshot.json> [import.sql]");
}

function normalize(row) {
  return Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => {
    if (value !== null && ["is_favorite", "email_verified"].includes(key)) value = Boolean(value);
    if (key === "tags" && typeof value === "string") value = JSON.parse(value);
    // Both databases store UTC instants as millisecond timestamps without a zone.
    if (value !== null && (key.endsWith("_at") || key === "datetime_original")) {
      value = new Date(String(value).replace(" ", "T").replace(/Z$/, "") + "Z").toISOString();
    }
    return [key, value];
  }));
}

if (command === "export") {
  const sourceUrl = process.env.DATABASE_URL;
  if (!sourceUrl?.startsWith("mysql://")) throw new Error("Export requires the source MySQL DATABASE_URL");
  const connection = await mysql.createConnection({ uri: sourceUrl, dateStrings: true, timezone: "Z", connectTimeout: 10000 });
  try {
    await connection.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await connection.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
    const snapshot = { createdAt: new Date().toISOString(), sourceDatabase: new URL(sourceUrl).pathname.slice(1), tables: {} };
    for (const table of tables) {
      const [rows] = await connection.query(`SELECT * FROM \`${table}\` ORDER BY id`);
      const [ddl] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      snapshot.tables[table] = { rows, ddl: ddl[0]["Create Table"] };
      console.log(`${table}: ${rows.length}`);
    }
    await connection.commit();
    await fs.mkdir(path.dirname(snapshotPath), { recursive: true, mode: 0o700 });
    const data = JSON.stringify(snapshot, null, 2);
    await fs.writeFile(snapshotPath, data, { flag: "wx", mode: 0o600 });
    console.log(`Backup SHA-256: ${crypto.createHash("sha256").update(data).digest("hex")}`);
  } finally {
    await connection.end();
  }
} else {
  const snapshot = JSON.parse(await fs.readFile(snapshotPath, "utf8"));
  if (command === "build-import") {
    if (!outputPath) throw new Error("An output SQL file is required");
    const statements = ["DO $migration$ BEGIN"];
    // Never overwrite an existing destination. The entire import is one transaction.
    for (const table of tables) {
      statements.push(`IF EXISTS (SELECT 1 FROM public.${table}) THEN RAISE EXCEPTION 'Destination ${table} is not empty'; END IF;`);
    }
    for (const table of tables) {
      const rows = snapshot.tables[table].rows.map(normalize);
      if (!rows.length) continue;
      const tag = `$data_${crypto.randomBytes(8).toString("hex")}$`;
      statements.push(`INSERT INTO public.${table} SELECT * FROM json_populate_recordset(NULL::public.${table}, ${tag}${JSON.stringify(rows)}${tag}::json);`);
    }
    statements.push("END $migration$;");
    await fs.writeFile(outputPath, statements.join("\n"), { flag: "wx", mode: 0o600 });
    console.log(`Prepared atomic import of ${tables.length} tables`);
  } else {
    const envId = process.env.CLOUDBASE_ENV_ID;
    const apiKey = process.env.CLOUDBASE_API_KEY;
    if (!envId || !apiKey) throw new Error("Verification requires CLOUDBASE_ENV_ID and CLOUDBASE_API_KEY");
    for (const table of tables) {
      const response = await fetch(`https://${envId}.api.tcloudbasegateway.com/v1/rdb/exec-pgsql`, {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sql: `SELECT * FROM public.${table} ORDER BY id`, role: "cloudbase_postgres" }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`Verification failed for ${table}: HTTP ${response.status}`);
      const actual = (await response.json()).map(normalize).sort((a, b) => a.id.localeCompare(b.id));
      const expected = snapshot.tables[table].rows.map(normalize).sort((a, b) => a.id.localeCompare(b.id));
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Data mismatch in ${table}: expected ${expected.length} rows, received ${actual.length}. No data was changed.`);
      }
      console.log(`${table}: ${actual.length} rows, every field matches`);
    }
  }
}
