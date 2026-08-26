import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");

dotenv.config({ path: path.join(projectRoot, ".env.local") });

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required"
  );
}

const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
const exportId = new Date().toISOString().replaceAll(":", "-").replace(".", "-");
const exportRoot = path.join(projectRoot, ".migration", "supabase", exportId);
const tables = [
  "user",
  "account",
  "photos",
  "categories",
  "posts",
  "city_sets",
  "session",
  "verification",
];

await fs.mkdir(exportRoot, { recursive: true, mode: 0o700 });
await fs.chmod(exportRoot, 0o700);

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
};

async function fetchTable(table) {
  const pageSize = 1000;
  const rows = [];

  for (let offset = 0; ; offset += pageSize) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${encodeURIComponent(table)}?select=*&order=id.asc`,
      {
        headers: {
          ...headers,
          Range: `${offset}-${offset + pageSize - 1}`,
          Prefer: "count=exact",
        },
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`Failed to export ${table}: ${response.status} ${detail}`);
    }

    const page = await response.json();
    if (!Array.isArray(page)) {
      throw new Error(`Unexpected response while exporting ${table}`);
    }

    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return rows;
}

const manifest = {
  formatVersion: 1,
  source: "supabase-postgrest",
  projectRef,
  exportedAt: new Date().toISOString(),
  tables: {},
};

for (const table of tables) {
  const rows = await fetchTable(table);
  const json = `${JSON.stringify(rows, null, 2)}\n`;
  const destination = path.join(exportRoot, `${table}.json`);

  await fs.writeFile(destination, json, { encoding: "utf8", mode: 0o600 });
  await fs.chmod(destination, 0o600);

  manifest.tables[table] = {
    rows: rows.length,
    bytes: Buffer.byteLength(json),
    sha256: crypto.createHash("sha256").update(json).digest("hex"),
  };
}

const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
const manifestPath = path.join(exportRoot, "manifest.json");
await fs.writeFile(manifestPath, manifestJson, { encoding: "utf8", mode: 0o600 });
await fs.chmod(manifestPath, 0o600);

const totalRows = Object.values(manifest.tables).reduce(
  (sum, table) => sum + table.rows,
  0
);
const totalBytes = Object.values(manifest.tables).reduce(
  (sum, table) => sum + table.bytes,
  0
);

console.log(
  JSON.stringify(
    {
      exportRoot,
      manifestPath,
      projectRef,
      totalRows,
      totalBytes,
      tables: Object.fromEntries(
        Object.entries(manifest.tables).map(([table, summary]) => [
          table,
          { rows: summary.rows, bytes: summary.bytes },
        ])
      ),
    },
    null,
    2
  )
);
