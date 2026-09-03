import type { TravelArchive } from "@/modules/travel/ui/views/travel-view";
import {
  DEFAULT_CAPTURE_TIMEZONE_OFFSET,
  getCaptureYear,
} from "@/modules/photos/lib/camera-metadata";

export type TravelImage = {
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
};

export type TravelPhotoEntry = TravelImage & {
  id: string;
  title: string;
  description: string;
  blurData: string;
};

export type TravelCityEntry = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  photoCount: number;
  year: string;
  image: TravelImage;
  fallbackImages?: TravelImage[];
  photos?: TravelPhotoEntry[];
};

export type TravelCountryGroup = {
  code: string;
  name: string;
  cities: TravelCityEntry[];
  frames: number;
  years: string[];
  images: TravelImage[];
};

const fallbackEntries: TravelCityEntry[] = [
  {
    id: "fallback-tekapo",
    city: "Lake Tekapo",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 5,
    year: "2026",
    image: {
      url: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
      width: 1360,
      height: 2400,
      aspectRatio: 1360 / 2400,
    },
  },
  {
    id: "fallback-wanaka",
    city: "Wānaka",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 4,
    year: "2026",
    image: {
      url: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
      width: 1800,
      height: 2400,
      aspectRatio: 1800 / 2400,
    },
  },
  {
    id: "fallback-aoraki",
    city: "Aoraki / Mount Cook",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 3,
    year: "2026",
    image: {
      url: "/journeys/newzealand-2026/photos/01-cover-mt-cook.jpg",
      width: 2400,
      height: 1350,
      aspectRatio: 2400 / 1350,
    },
  },
  {
    id: "fallback-sydney",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    photoCount: 8,
    year: "2026",
    image: {
      url: "/about-yueyong.jpg",
      width: 1800,
      height: 2400,
      aspectRatio: 1800 / 2400,
    },
  },
  {
    id: "fallback-samarkand",
    city: "Samarkand",
    country: "Uzbekistan",
    countryCode: "UZ",
    photoCount: 1,
    year: "2026",
    image: {
      url: "https://cdn.ytools.xyz/photos/DSC00614-1771667465746.jpg?imageView2/2/w/3840/q/75|imageslim",
      width: 3,
      height: 2,
      aspectRatio: 1.5,
    },
  },
];

const toYear = (
  value: Date | string | null | undefined,
  timezoneOffsetMinutes = DEFAULT_CAPTURE_TIMEZONE_OFFSET,
) => {
  const year = getCaptureYear(value, timezoneOffsetMinutes);
  return year === null ? "Archive" : String(year);
};

export const toPlaceSlug = (value: string) => {
  const asciiSlug = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (asciiSlug) return asciiSlug;

  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
};

export const getTravelEntries = (archive: TravelArchive): TravelCityEntry[] => {
  const remoteEntries = archive.items
    .filter((item) => item.coverPhoto)
    .map((item) => ({
      id: item.id,
      city: item.city,
      country: item.country,
      countryCode: item.countryCode.toUpperCase(),
      photoCount: item.photoCount,
      year: toYear(
        item.coverPhoto?.dateTimeOriginal ?? item.updatedAt,
        item.coverPhoto?.captureTimezoneOffset ??
          DEFAULT_CAPTURE_TIMEZONE_OFFSET,
      ),
      image: {
        url: item.coverPhoto!.url,
        width: item.coverPhoto!.width,
        height: item.coverPhoto!.height,
        aspectRatio: item.coverPhoto!.aspectRatio,
      },
      fallbackImages: item.photos.filter(
        (photo) => photo.url !== item.coverPhoto!.url,
      ),
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
    if (
      !current.images.some((image) => image.url === entry.image.url) &&
      current.images.length < 3
    ) {
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
