"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import { journeys } from "@/modules/journeys/data/journeys";
import type { PublicJourneyStory } from "@/modules/journeys/types";
import {
  localizeJourney,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

type JourneyArchiveEntry = {
  slug: string;
  title: string;
  coverImage: string | null;
  coverAlt: string;
  route: string[];
  meta: string;
  sortDate: string;
  isFieldNote: boolean;
};

export const JourneysView = ({
  stories,
}: {
  stories: PublicJourneyStory[];
}) => {
  const { copy, locale } = useSiteLocale();
  const localizedJourneys = journeys.map((journey) =>
    localizeJourney(journey, locale),
  );
  const journeySlugs = new Set(localizedJourneys.map(({ slug }) => slug));
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "zh-CN" ? "zh-CN" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const entries: JourneyArchiveEntry[] = [
    ...localizedJourneys.map((journey) => ({
      slug: journey.slug,
      title: journey.title,
      coverImage: journey.coverImage,
      coverAlt: journey.coverAlt,
      route: journey.route,
      meta: `${copy.journeys.journeyLabel} · ${journey.country} · ${journey.dates}`,
      sortDate: `${journey.year}-12-31`,
      isFieldNote: false,
    })),
    ...stories
      .filter((story) => !journeySlugs.has(story.slug))
      .map((story) => ({
        slug: story.slug,
        title: story.title,
        coverImage: story.coverImage,
        coverAlt: story.title,
        route: story.tags || [],
        meta: [
          copy.journeys.fieldNote,
          dateFormatter.format(new Date(story.updatedAt)),
          story.readingTimeMinutes
            ? copy.journeys.minRead(story.readingTimeMinutes)
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
        sortDate: story.updatedAt,
        isFieldNote: true,
      })),
  ].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  return (
    <section className={`${styles.page} ${styles.pageMist}`}>
      <div className={styles.journeyIndexIntro}>
        <div>
          <p className={styles.eyebrow}>{copy.journeys.eyebrow}</p>
          <h1 className={styles.displayTitle}>
            {copy.journeys.titleStart}
            <br />
            <em>{copy.journeys.titleEnd}</em>
          </h1>
        </div>
      </div>

      <div className={styles.journeyArchive}>
        {entries.map((entry, index) => (
          <article className={styles.journeyArchiveItem} key={entry.slug}>
            <Link
              href={`/journeys/${entry.slug}`}
              className={styles.journeyArchiveImage}
            >
              {entry.coverImage ? (
                <Image
                  src={entry.coverImage}
                  alt={entry.coverAlt}
                  fill
                  loader={getArchiveImageLoader(entry.coverImage)}
                  priority={index === 0}
                  sizes="(min-width: 900px) 58vw, 92vw"
                  className={styles.imageCover}
                />
              ) : (
                <span className={styles.journeyArchivePlaceholder}>
                  <small>{copy.journeys.fieldNote}</small>
                  <strong>{entry.title}</strong>
                </span>
              )}
            </Link>

            <div className={styles.journeyArchiveCopy}>
              <span className={styles.journeyArchiveNumber}>
                J{String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className={styles.journeyArchiveMeta}>{entry.meta}</p>
                <h2>{entry.title}</h2>
                {entry.route.length > 0 && (
                  <div className={styles.journeyRoute}>
                    {entry.route.map((place) => (
                      <span key={place}>{place}</span>
                    ))}
                  </div>
                )}
                <Link
                  href={`/journeys/${entry.slug}`}
                  className={styles.textLink}
                >
                  {entry.isFieldNote
                    ? copy.journeys.readNote
                    : copy.journeys.read}{" "}
                  <ArrowUpRight size={15} strokeWidth={1.4} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
