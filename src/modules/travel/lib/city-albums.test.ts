import assert from "node:assert/strict";
import test from "node:test";

import { getCityAliases, getCanonicalCity, mergeCityAlbums } from "./city-albums";
import { getCoverCandidates } from "./cover-candidates";

const album = (city: string, ids: string[], countryCode = "UZ") => {
  const photos = ids.map((id) => ({ id, url: `/photos/${id}.jpg` }));
  return { city, countryCode, photoCount: photos.length, coverPhoto: photos[0], photos };
};

test("city aliases share one album with all nine photographs and the main cover", () => {
  const main = album("Samarkand City", ["1", "2", "3", "4", "5", "6"]);
  const secondary = album("撒马尔罕", ["7", "8", "9"]);
  const [merged] = mergeCityAlbums([secondary, main]);
  assert.equal(merged.city, "Samarkand");
  assert.equal(merged.photoCount, 9);
  assert.equal(merged.photos.length, 9);
  assert.deepEqual(merged.coverPhoto, main.coverPhoto);
  assert.equal(mergeCityAlbums([main, secondary]).length, 1);
});

test("repeated cover photos are included only once", () => {
  const [merged] = mergeCityAlbums([
    album("Samarkand", ["1", "2"]),
    album("Samarkand City", ["2", "3"]),
  ]);
  assert.deepEqual(merged.photos.map((photo) => photo.id), ["1", "2", "3"]);
});

test("normalization is country scoped and preserves unrelated cities", () => {
  assert.equal(getCanonicalCity(" samarkand city ", "uz"), "Samarkand");
  assert.equal(getCanonicalCity("Samarkand City", "US"), "Samarkand City");
  assert.equal(mergeCityAlbums([
    album("Samarkand", ["1"]),
    album("Samarkand", ["2"], "US"),
    album("Tashkent", ["3"]),
  ]).length, 3);
  assert.deepEqual(getCityAliases("Samarkand", "UZ"), [
    "Samarkand", "Samarkand City", "撒马尔罕",
  ]);
});

test("a missing cover falls back to a photograph from the same city", () => {
  const source: Omit<ReturnType<typeof album>, "coverPhoto"> & {
    coverPhoto: { id: string; url: string } | null;
  } = { ...album("Tashkent", ["1"]), coverPhoto: null };
  const [merged] = mergeCityAlbums([source]);
  assert.equal(merged.coverPhoto?.id, "1");
});

test("failed cover transforms retry the original before the next city photograph", () => {
  const cover = "https://cdn.ytools.xyz/photos/cover.jpg?imageView2/2/w/1080";
  const alternate = "https://cdn.ytools.xyz/photos/alternate.jpg";
  assert.deepEqual(getCoverCandidates([cover, cover, alternate]), [
    { src: cover, unoptimized: false },
    { src: "https://cdn.ytools.xyz/photos/cover.jpg", unoptimized: true },
    { src: alternate, unoptimized: false },
    { src: alternate, unoptimized: true },
  ]);
});

test("cover retries preserve other hosts' query parameters and local URLs", () => {
  const urls = ["https://example.com/photo.jpg?token=example", "/cover.jpg"];
  assert.deepEqual(getCoverCandidates(urls), urls.map((src) => ({ src, unoptimized: false })));
});
