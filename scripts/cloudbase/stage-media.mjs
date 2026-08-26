import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const supabaseRoot = path.join(projectRoot, ".migration", "supabase");
const stageRoot = path.join(
  projectRoot,
  ".migration",
  "media",
  "cloudbase-photo-site"
);
const filesRoot = path.join(stageRoot, "files");
const manifestPath = path.join(stageRoot, "manifest.json");

const concurrency = Number.parseInt(process.env.MEDIA_MIGRATION_CONCURRENCY ?? "4", 10);
const maxAttempts = Number.parseInt(process.env.MEDIA_MIGRATION_ATTEMPTS ?? "3", 10);

if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 12) {
  throw new Error("MEDIA_MIGRATION_CONCURRENCY must be an integer from 1 to 12");
}

if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 8) {
  throw new Error("MEDIA_MIGRATION_ATTEMPTS must be an integer from 1 to 8");
}

async function latestSnapshotDirectory() {
  const entries = await fsp.readdir(supabaseRoot, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const candidate of candidates) {
    const photosPath = path.join(supabaseRoot, candidate, "photos.json");
    try {
      await fsp.access(photosPath);
      return path.join(supabaseRoot, candidate);
    } catch {
      // Ignore incomplete snapshots.
    }
  }

  throw new Error(`No complete Supabase snapshot found under ${supabaseRoot}`);
}

function extensionFor(url) {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  const supported = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
    ".gif",
    ".heic",
    ".heif",
  ]);
  return supported.has(extension) ? extension : ".bin";
}

function destinationFor(url) {
  const name = crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
  const filename = `${name}${extensionFor(url)}`;
  return {
    filename,
    localPath: path.join(filesRoot, filename),
    cloudPath: `photo-site/photos/${filename}`,
  };
}

async function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  const input = fs.createReadStream(filePath);
  for await (const chunk of input) hash.update(chunk);
  return hash.digest("hex");
}

async function inspectExisting(filePath, expected) {
  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile() || stat.size === 0) return null;
    if (expected?.bytes && expected.bytes !== stat.size) return null;

    const sha256 = await hashFile(filePath);
    if (expected?.sha256 && expected.sha256 !== sha256) return null;

    return { bytes: stat.size, sha256 };
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function download(entry, previous) {
  const destination = destinationFor(entry.url);
  const existing = await inspectExisting(destination.localPath, previous);

  if (existing) {
    return {
      ...entry,
      ...destination,
      status: "ready",
      sourceStatus: previous?.sourceStatus ?? 200,
      contentType: previous?.contentType ?? null,
      ...existing,
      resumed: true,
    };
  }

  const temporaryPath = `${destination.localPath}.part`;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fsp.rm(temporaryPath, { force: true });
      const response = await fetch(entry.url, {
        headers: { "user-agent": "photo-site-cloudbase-migration/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(120_000),
      });

      if (!response.ok || !response.body) {
        const error = new Error(`Source returned HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      await pipeline(response.body, fs.createWriteStream(temporaryPath, { mode: 0o600 }));
      const stat = await fsp.stat(temporaryPath);
      const declaredLength = Number.parseInt(response.headers.get("content-length") ?? "", 10);

      if (stat.size === 0) throw new Error("Downloaded file is empty");
      if (Number.isFinite(declaredLength) && declaredLength !== stat.size) {
        throw new Error(
          `Content-Length mismatch: expected ${declaredLength}, received ${stat.size}`
        );
      }

      const sha256 = await hashFile(temporaryPath);
      await fsp.rename(temporaryPath, destination.localPath);
      await fsp.chmod(destination.localPath, 0o600);

      return {
        ...entry,
        ...destination,
        status: "ready",
        sourceStatus: response.status,
        contentType: response.headers.get("content-type"),
        bytes: stat.size,
        sha256,
        resumed: false,
      };
    } catch (error) {
      lastError = error;
      await fsp.rm(temporaryPath, { force: true });
      if (error?.status === 404) break;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 750));
      }
    }
  }

  return {
    ...entry,
    ...destination,
    status: "missing",
    sourceStatus: lastError?.status ?? null,
    error: String(lastError?.message ?? lastError).slice(0, 300),
  };
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
      const result = results[index];
      process.stderr.write(
        `[${index + 1}/${items.length}] ${result.status} ${result.cloudPath}\n`
      );
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

await fsp.mkdir(filesRoot, { recursive: true, mode: 0o700 });
await fsp.chmod(path.dirname(stageRoot), 0o700);
await fsp.chmod(stageRoot, 0o700);
await fsp.chmod(filesRoot, 0o700);

const snapshotDirectory = await latestSnapshotDirectory();
const photos = JSON.parse(
  await fsp.readFile(path.join(snapshotDirectory, "photos.json"), "utf8")
);

const grouped = new Map();
for (const photo of photos) {
  const current = grouped.get(photo.url) ?? { url: photo.url, photoIds: [] };
  current.photoIds.push(photo.id);
  grouped.set(photo.url, current);
}

let previousByUrl = new Map();
try {
  const previousManifest = JSON.parse(await fsp.readFile(manifestPath, "utf8"));
  previousByUrl = new Map(previousManifest.objects.map((object) => [object.url, object]));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const entries = [...grouped.values()].sort((a, b) => a.url.localeCompare(b.url));
const objects = await mapLimit(entries, concurrency, (entry) =>
  download(entry, previousByUrl.get(entry.url))
);

const ready = objects.filter((object) => object.status === "ready");
const missing = objects.filter((object) => object.status !== "ready");
const manifest = {
  formatVersion: 1,
  sourceSnapshot: path.relative(projectRoot, snapshotDirectory),
  generatedAt: new Date().toISOString(),
  sourcePhotoRows: photos.length,
  uniqueUrls: objects.length,
  readyObjects: ready.length,
  missingObjects: missing.length,
  totalBytes: ready.reduce((sum, object) => sum + object.bytes, 0),
  cloudPrefix: "photo-site/photos/",
  objects,
};

await fsp.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
  encoding: "utf8",
  mode: 0o600,
});
await fsp.chmod(manifestPath, 0o600);

console.log(
  JSON.stringify(
    {
      stageRoot,
      manifestPath,
      sourcePhotoRows: manifest.sourcePhotoRows,
      uniqueUrls: manifest.uniqueUrls,
      readyObjects: manifest.readyObjects,
      missingObjects: manifest.missingObjects,
      totalBytes: manifest.totalBytes,
      totalGiB: Number((manifest.totalBytes / 1024 ** 3).toFixed(3)),
      missing: missing.map(({ url, photoIds, sourceStatus, error }) => ({
        url,
        photoIds,
        sourceStatus,
        error,
      })),
    },
    null,
    2
  )
);

if (missing.length > 0) process.exitCode = 2;
