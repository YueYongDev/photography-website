import assert from "node:assert/strict";
import test from "node:test";

import type { TravelArchive } from "../ui/views/travel-view";
import { getCountryGroups } from "./country-groups";
import { getPlacesCountryCode, getPlacesCountryName } from "./places-country";

const album = (
  city: string,
  countryCode: string,
  country: string,
  photoCount: number,
): TravelArchive["items"][number] => ({
  id: `${countryCode}-${city}`,
  description: "",
  country,
  countryCode,
  city,
  photoCount,
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  coverPhoto: {
    id: `photo-${city}`,
    url: `/photos/${city}.jpg`,
    title: city,
    blurData: "",
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    dateTimeOriginal: new Date("2023-01-01T00:00:00Z"),
    captureTimezoneOffset: 480,
  },
  photos: [],
});

test("Places includes Hong Kong under China without losing counts or source codes", () => {
  const items = [
    album("Hong Kong", "HK", "Hong Kong", 3),
    album("Hangzhou", "CN", "中国", 8),
    album("Hanoi", "VN", "Vietnam", 5),
  ];
  const before = structuredClone(items);
  for (const ordered of [items, [...items].reverse()]) {
    const groups = getCountryGroups({ items: ordered });
    const china = groups.find((group) => group.code === "CN")!;
    assert.equal(groups.length, 2);
    assert.equal(groups.some((group) => group.code === "HK"), false);
    assert.equal(china.name, "China");
    assert.equal(china.frames, 11);
    assert.equal(china.cities.length, 2);
    assert.equal(china.cities.find((city) => city.city === "Hong Kong")?.countryCode, "HK");
    assert.equal(groups.reduce((sum, group) => sum + group.frames, 0), 16);
  }
  assert.deepEqual(items, before);
});

test("Hong Kong remains reachable in China when it is the only Chinese album", () => {
  const [china] = getCountryGroups({ items: [album("Hong Kong", "HK", "Hong Kong", 3)] });
  assert.equal(china.code, "CN");
  assert.equal(china.name, "China");
  assert.equal(china.frames, 3);
  assert.equal(china.cities[0].city, "Hong Kong");
  assert.equal(china.cities[0].countryCode, "HK");
});

test("Places country normalization is scoped to Hong Kong and keeps other groups unchanged", () => {
  assert.equal(getPlacesCountryCode(" hk "), "CN");
  assert.equal(getPlacesCountryName("Hong Kong", "HK"), "China");
  assert.equal(getPlacesCountryCode("CN"), "CN");
  assert.equal(getPlacesCountryCode("VN"), "VN");
  assert.equal(getPlacesCountryName("Vietnam", "VN"), "Vietnam");
  assert.equal(getPlacesCountryCode("MO"), "MO");
  assert.equal(getPlacesCountryCode("TW"), "TW");
});
