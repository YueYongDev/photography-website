import type { TravelArchive } from "@/modules/travel/ui/views/travel-view";

export type TravelCityEntry = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  photoCount: number;
  year: string;
  image: string;
};

export type TravelCountryGroup = {
  code: string;
  name: string;
  cities: TravelCityEntry[];
  frames: number;
  years: string[];
  images: string[];
};

const fallbackEntries: TravelCityEntry[] = [
  {
    id: "fallback-tekapo",
    city: "Lake Tekapo",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 5,
    year: "2026",
    image: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
  },
  {
    id: "fallback-wanaka",
    city: "Wānaka",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 4,
    year: "2026",
    image: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
  },
  {
    id: "fallback-aoraki",
    city: "Aoraki / Mount Cook",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 3,
    year: "2026",
    image: "/journeys/newzealand-2026/photos/01-cover-mt-cook.jpg",
  },
  {
    id: "fallback-sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    photoCount: 8,
    year: "2026",
    image: "/about-yueyong.jpg",
  },
  {
    id: "fallback-samarkand",
    city: "Samarkand",
    country: "Uzbekistan",
    countryCode: "UZ",
    photoCount: 1,
    year: "2026",
    image:
      "https://cdn.ytools.xyz/photos/DSC00614-1771667465746.jpg?imageView2/2/w/3840/q/75|imageslim",
  },
];

const toYear = (value: Date | string | null | undefined) => {
  if (!value) return "Archive";
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? "Archive" : String(year);
};

export const toPlaceSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getTravelEntries = (archive: TravelArchive): TravelCityEntry[] => {
  const remoteEntries = archive.items
    .filter((item) => item.coverPhoto)
    .map((item) => ({
      id: item.id,
      city: item.city,
      country: item.country,
      countryCode: item.countryCode.toUpperCase(),
      photoCount: item.photoCount,
      year: toYear(item.coverPhoto?.dateTimeOriginal ?? item.updatedAt),
      image: item.coverPhoto!.url,
    }));

  return remoteEntries.length > 0 ? remoteEntries : fallbackEntries;
};

export const getCountryGroups = (archive: TravelArchive): TravelCountryGroup[] => {
  const groups = new Map<string, TravelCountryGroup>();

  getTravelEntries(archive).forEach((entry) => {
    const key = entry.countryCode.toUpperCase();
    const current = groups.get(key) ?? {
      code: key,
      name: entry.country,
      cities: [],
      frames: 0,
      years: [],
      images: [],
    };

    current.cities.push(entry);
    current.frames += entry.photoCount;
    if (!current.years.includes(entry.year)) current.years.push(entry.year);
    if (!current.images.includes(entry.image) && current.images.length < 3) {
      current.images.push(entry.image);
    }
    groups.set(key, current);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      cities: group.cities.sort((a, b) => a.city.localeCompare(b.city)),
      years: group.years.sort().reverse(),
    }))
    .sort((a, b) => b.frames - a.frames || a.name.localeCompare(b.name));
};
