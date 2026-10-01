import assert from "node:assert/strict";
import { config } from "dotenv";

config({ path: process.env.MIGRATION_ENV_FILE ?? ".env.local" });

async function main() {
  const { db } = await import("../../src/db/drizzle");
  const { drizzlePgQuery, executePgSql } = await import("../../src/db/cloudbase-pg");
  const { photos, citySets } = await import("../../src/db/schema/photos");
  const { count, eq } = await import("drizzle-orm");
  const baseline = await db.select({ count: count() }).from(photos);
  const [original] = await db.select().from(photos).limit(1);
  assert(original, "At least one migrated photo is required");
  assert(original.createdAt instanceof Date && Number.isFinite(original.createdAt.getTime()));
  assert.equal(typeof original.isFavorite, "boolean");
  const albums = await db.query.citySets.findMany({ limit: 3, with: { coverPhoto: true } });
  assert(albums.every((album) => album.coverPhoto?.id === album.coverPhotoId));
  const marker = "参数 ' ; -- $1 $$ 中文";
  const ordered = await drizzlePgQuery("SELECT $1::text AS z, $2::int AS a, true AS b, null AS n", [marker, 42], "all");
  assert.deepEqual(ordered.rows, [[marker, 42, true, null]]);
  const duplicates = await drizzlePgQuery("SELECT 1 AS repeated, 2 AS repeated", [], "all");
  assert.deepEqual(duplicates.rows, [[1, 2]]);
  const captureYear = await executePgSql("SELECT EXTRACT(YEAR FROM ($1::timestamp + $2::integer * INTERVAL '1 minute'))::integer AS year", ["2025-12-31 20:00:00", 480]);
  assert.equal(captureYear[0].year, 2026);
  console.log("PASS: reads, dates, booleans, relations, parameter binding and ordered/duplicate columns");

  if (!process.argv.includes("--write-test")) return;
  if (process.env.CLOUDBASE_ENV_ID !== "yueyong-photo-d6gm6308c8838e9e7") {
    throw new Error("Write validation is restricted to the explicitly selected migration destination");
  }
  const ids = [crypto.randomUUID(), crypto.randomUUID()];
  const city = `migration-check-${crypto.randomUUID()}`;
  const country = "Migration validation";
  const fixture = { ...original, createdAt: undefined, updatedAt: undefined, country, countryCode: "ZZ", region: null, city, isFavorite: false, visibility: "private" as const };
  const getAlbum = (name: string) => db.select().from(citySets).where(eq(citySets.city, name));
  try {
    const [created] = await db.insert(photos).values({ ...fixture, id: ids[0] }).returning();
    assert(Math.abs(created.createdAt.getTime() - Date.now()) < 60000, "Database defaults must store UTC, despite the gateway's PRC session timezone");
    await db.insert(photos).values({ ...fixture, id: ids[1] });
    let [album] = await getAlbum(city);
    assert.equal(album.photoCount, 2);
    assert.equal(album.coverPhotoId, ids[0]);
    const [changed] = await db.update(photos).set({ city: `${city}-moved` }).where(eq(photos.id, ids[0])).returning();
    assert.equal(changed.city, `${city}-moved`);
    [album] = await getAlbum(city);
    assert.equal(album.photoCount, 1);
    assert.equal(album.coverPhotoId, ids[1]);
    assert.equal((await getAlbum(`${city}-moved`))[0].photoCount, 1);
    await db.update(photos).set({ countryCode: "JP", region: `${city}-region` }).where(eq(photos.id, ids[1]));
    assert.equal((await getAlbum(city)).length, 0);
    assert.equal((await getAlbum(`${city}-region`))[0].coverPhotoId, ids[1]);
    const removed = await db.delete(photos).where(eq(photos.id, ids[0]));
    assert.equal(removed.length, 1, "Non-returning writes expose an accurate affected-row count");
    assert.equal((await getAlbum(`${city}-moved`)).length, 0);
    await db.delete(photos).where(eq(photos.id, ids[1]));
    assert.equal((await getAlbum(`${city}-region`)).length, 0);

    // A failed batch must roll back both the inserted photo and its triggered album.
    const good = { ...fixture, id: ids[0] };
    await assert.rejects(db.insert(photos).values([good, { ...fixture, id: ids[1], width: null as unknown as number }]));
    assert.equal((await getAlbum(city)).length, 0);
    assert.deepEqual(await db.select({ count: count() }).from(photos), baseline);
    console.log("PASS: create/update/delete, cover replacement, Japanese region albums, affected rows and transaction rollback");
  } finally {
    // Only remove our randomly generated fixture records, never their shared image URL.
    for (const id of ids) await executePgSql('DELETE FROM public.photo_site_photos WHERE id = $1', [id]);
  }
}

main().catch((error: unknown) => {
  // Drizzle errors include bound values in their message/cause; keep credentials private.
  console.error(error instanceof assert.AssertionError ? error.message : "PostgreSQL verification failed; inspect the failing test locally.");
  let cause: unknown = error;
  while (cause instanceof Error) {
    if (cause.message.startsWith("CloudBase PostgreSQL")) console.error(cause.message);
    cause = cause.cause;
  }
  process.exitCode = 1;
});
