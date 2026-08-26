import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const snapshotsRoot = path.join(projectRoot, ".migration", "supabase");

const requestedSnapshot = process.argv[2];
const snapshotId =
  requestedSnapshot ?? (await fs.readdir(snapshotsRoot)).sort().at(-1);

if (!snapshotId) {
  throw new Error("No Supabase snapshot exists. Run export-supabase.mjs first.");
}

const snapshotRoot = path.join(snapshotsRoot, snapshotId);

async function readRows(table) {
  return JSON.parse(
    await fs.readFile(path.join(snapshotRoot, `${table}.json`), "utf8")
  );
}

function sqlString(value) {
  const hex = Buffer.from(value, "utf8").toString("hex");
  return `CONVERT(X'${hex}' USING utf8mb4)`;
}

function sqlDate(value) {
  if (value === null || value === undefined) return "NULL";
  const source = /(?:Z|[+-]\d\d(?::?\d\d)?)$/.test(value)
    ? value
    : `${value}Z`;
  const date = new Date(source);
  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid timestamp in export: ${value}`);
  }
  return sqlString(date.toISOString().slice(0, 23).replace("T", " "));
}

function sqlValue(value, kind = "default") {
  if (value === null || value === undefined) return "NULL";
  if (kind === "date") return sqlDate(value);
  if (kind === "json") return sqlString(JSON.stringify(value));
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Non-finite number in export");
    return String(value);
  }
  return sqlString(String(value));
}

const definitions = [
  {
    source: "user",
    target: "photo_site_user",
    columns: {
      id: "default",
      name: "default",
      email: "default",
      email_verified: "default",
      image: "default",
      created_at: "date",
      updated_at: "date",
    },
  },
  {
    source: "account",
    target: "photo_site_account",
    columns: {
      id: "default",
      issuer: "default",
      account_id: "default",
      provider_id: "default",
      user_id: "default",
      access_token: "default",
      refresh_token: "default",
      id_token: "default",
      access_token_expires_at: "date",
      refresh_token_expires_at: "date",
      scope: "default",
      password: "default",
      created_at: "date",
      updated_at: "date",
    },
    transform(row) {
      return {
        ...row,
        issuer:
          row.provider_id === "credential"
            ? "local:credential"
            : `local:oauth:${encodeURIComponent(row.provider_id)}`,
      };
    },
  },
  {
    source: "photos",
    target: "photo_site_photos",
    columns: {
      id: "default",
      url: "default",
      title: "default",
      description: "default",
      is_favorite: "default",
      visibility: "default",
      aspect_ratio: "default",
      width: "default",
      height: "default",
      blur_data: "default",
      country: "default",
      country_code: "default",
      region: "default",
      city: "default",
      district: "default",
      full_address: "default",
      place_formatted: "default",
      make: "default",
      model: "default",
      lens_model: "default",
      focal_length: "default",
      focal_length_35mm: "default",
      f_number: "default",
      iso: "default",
      exposure_time: "default",
      exposure_compensation: "default",
      latitude: "default",
      longitude: "default",
      gps_altitude: "default",
      datetime_original: "date",
      created_at: "date",
      updated_at: "date",
    },
    transform(row, summary) {
      if (row.updated_at === null) {
        summary.normalizedPhotoUpdatedAt += 1;
        return { ...row, updated_at: row.created_at };
      }
      return row;
    },
  },
  {
    source: "categories",
    target: "photo_site_categories",
    columns: { id: "default", name: "default" },
  },
  {
    source: "posts",
    target: "photo_site_posts",
    columns: {
      id: "default",
      title: "default",
      slug: "default",
      category_id: "default",
      visibility: "default",
      tags: "json",
      cover_image: "default",
      description: "default",
      content: "default",
      reading_time_minutes: "default",
      created_at: "date",
      updated_at: "date",
    },
  },
  {
    source: "city_sets",
    target: "photo_site_city_sets",
    columns: {
      id: "default",
      description: "default",
      country: "default",
      country_code: "default",
      city: "default",
      cover_photo_id: "default",
      photo_count: "default",
      created_at: "date",
      updated_at: "date",
    },
  },
  {
    source: "session",
    target: "photo_site_session",
    columns: {
      id: "default",
      expires_at: "date",
      token: "default",
      created_at: "date",
      updated_at: "date",
      ip_address: "default",
      user_agent: "default",
      user_id: "default",
    },
  },
  {
    source: "verification",
    target: "photo_site_verification",
    columns: {
      id: "default",
      identifier: "default",
      value: "default",
      expires_at: "date",
      created_at: "date",
      updated_at: "date",
    },
  },
];

const batchSize = 20;
const statements = [];
const summary = {
  snapshotId,
  rows: {},
  normalizedPhotoUpdatedAt: 0,
};

for (const definition of definitions) {
  let rows = await readRows(definition.source);
  rows = rows.map((row) =>
    definition.transform ? definition.transform(row, summary) : row
  );
  summary.rows[definition.target] = rows.length;

  const columns = Object.keys(definition.columns);
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const values = batch
      .map(
        (row) =>
          `(${columns
            .map((column) => sqlValue(row[column], definition.columns[column]))
            .join(", ")})`
      )
      .join(",\n");
    const updates = columns
      .filter((column) => column !== "id")
      .map((column) => `${column}=VALUES(${column})`)
      .join(", ");

    statements.push(
      `INSERT INTO ${definition.target} (${columns.join(", ")}) VALUES\n${values}\nON DUPLICATE KEY UPDATE ${updates}`
    );
  }
}

const output = {
  formatVersion: 1,
  builtAt: new Date().toISOString(),
  summary,
  statements,
};
const outputPath = path.join(snapshotRoot, "mysql-import.json");
await fs.writeFile(outputPath, `${JSON.stringify(output)}\n`, {
  encoding: "utf8",
  mode: 0o600,
});
await fs.chmod(outputPath, 0o600);

console.log(
  JSON.stringify(
    {
      outputPath,
      statementCount: statements.length,
      summary,
    },
    null,
    2
  )
);
