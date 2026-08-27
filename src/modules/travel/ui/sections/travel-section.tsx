import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Map, Rows3 } from "lucide-react";

import styles from "@/modules/site/ui/public-site.module.css";
import type { TravelArchive } from "../views/travel-view";

type AtlasEntry = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  photoCount: number;
  year: string;
  image: string;
  href: string;
};

const fallbackEntries: AtlasEntry[] = [
  {
    id: "fallback-tekapo",
    city: "Tekapo",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 26,
    year: "2026",
    image: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
    href: "/journeys/newzealand-2026",
  },
  {
    id: "fallback-wanaka",
    city: "Wānaka",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 18,
    year: "2026",
    image: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
    href: "/journeys/newzealand-2026",
  },
  {
    id: "fallback-glenorchy",
    city: "Glenorchy",
    country: "New Zealand",
    countryCode: "NZ",
    photoCount: 14,
    year: "2026",
    image: "/journeys/newzealand-2026/photos/04-glenorchy-peak.jpg",
    href: "/journeys/newzealand-2026",
  },
];

const toYear = (value: Date | string | null | undefined) => {
  if (!value) return "Archive";
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? "Archive" : String(year);
};

export const TravelSection = ({ archive }: { archive: TravelArchive }) => {
  const remoteEntries: AtlasEntry[] = archive.items
    .filter((item) => item.coverPhoto)
    .map((item) => ({
      id: item.id,
      city: item.city,
      country: item.country,
      countryCode: item.countryCode,
      photoCount: item.photoCount,
      year: toYear(item.coverPhoto?.dateTimeOriginal ?? item.updatedAt),
      image: item.coverPhoto!.url,
      href: `/travel/${encodeURIComponent(item.city)}`,
    }));

  const entries = remoteEntries.length > 0 ? remoteEntries : fallbackEntries;
  const countries = new Set(entries.map((entry) => entry.countryCode)).size;
  const totalFrames = entries.reduce((total, entry) => total + entry.photoCount, 0);

  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>03 / Atlas</p>
      <h1 className={styles.displayTitle}>
        A quiet index
        <br />
        <em>of place.</em>
      </h1>
      <p className={styles.lede}>
        Atlas is the geographic way back into the work — useful for finding a
        city or year, without turning every destination into another portfolio.
      </p>

      <div className={styles.atlasSummary}>
        <div className={styles.atlasStats}>
          <div className={styles.atlasStat}>
            <span>Territories</span>
            <strong>{String(countries).padStart(2, "0")}</strong>
          </div>
          <div className={styles.atlasStat}>
            <span>Places</span>
            <strong>{String(entries.length).padStart(2, "0")}</strong>
          </div>
          <div className={styles.atlasStat}>
            <span>Frames</span>
            <strong>{String(totalFrames).padStart(3, "0")}</strong>
          </div>
        </div>

        <div className={styles.viewSwitch} aria-label="Atlas views">
          <Link href="/travel" className={styles.viewActive}>
            <Rows3 size={14} strokeWidth={1.5} /> Index
          </Link>
          <Link href="/discover">
            <Map size={14} strokeWidth={1.5} /> Map
          </Link>
        </div>
      </div>

      <div className={styles.atlasTable}>
        <div className={styles.atlasHeader}>
          <span>Ref.</span>
          <span>Place</span>
          <span>Year</span>
          <span>Frames</span>
          <span>Open</span>
        </div>
        {entries.map((entry, index) => (
          <Link href={entry.href} className={styles.atlasRow} key={entry.id}>
            <span>A{String(index + 1).padStart(2, "0")}</span>
            <div className={styles.atlasPlace}>
              <div className={styles.atlasThumb}>
                <Image
                  src={entry.image}
                  alt={entry.city}
                  fill
                  unoptimized
                  sizes="96px"
                  className={styles.imageCover}
                />
              </div>
              <div>
                <strong>{entry.city}</strong>
                <small>{entry.country}</small>
              </div>
            </div>
            <span>{entry.year}</span>
            <span>{entry.photoCount}</span>
            <span>
              View <ArrowUpRight size={13} strokeWidth={1.4} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
