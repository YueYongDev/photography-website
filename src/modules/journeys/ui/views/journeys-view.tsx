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
  isDraft: boolean;
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
      sortDate: /^\d{4}$/.test(journey.year)
        ? `${journey.year}-12-31`
        : "0000-01-01",
      isFieldNote: false,
      isDraft: Boolean(journey.draft),
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
        isDraft: false,
      })),
  ].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  const featuredIndex = entries.findIndex((entry) => entry.coverImage);
  const featuredEntry =
    entries[featuredIndex >= 0 ? featuredIndex : 0] ?? null;
  const archiveYears = entries
    .map((entry) => Number(entry.sortDate.slice(0, 4)))
    .filter((year) => Number.isInteger(year) && year > 0);
  const yearRange =
    archiveYears.length > 0
      ? `${Math.min(...archiveYears)} — ${Math.max(...archiveYears)}`
      : "—";

  return (
    <section
      className={`${styles.page} ${styles.pageMist} ${styles.journeysPage}`}
    >
      <header className={styles.journeyIndexIntro}>
        <div className={styles.journeyIndexCopy} data-motion-reveal="left">
          <p className={styles.eyebrow}>{copy.journeys.eyebrow}</p>
          <div className={styles.journeyIndexCopyBody}>
            <h1 className={styles.journeyIndexTitle}>
              {copy.journeys.title}
            </h1>
            <p className={styles.journeyIndexDescription}>
              {copy.journeys.descriptionLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            {copy.journeys.attribution && (
              <cite className={styles.journeyIndexAttribution}>
                {copy.journeys.attribution}
              </cite>
            )}
            <dl className={styles.journeyIndexStats}>
              <div>
                <dt>{copy.journeys.entriesLabel}</dt>
                <dd>{String(entries.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>{copy.journeys.yearsLabel}</dt>
                <dd>{yearRange}</dd>
              </div>
            </dl>
          </div>
        </div>

        {featuredEntry && (
          <figure
            className={styles.journeyIndexFeature}
            data-motion-image
            data-motion-parallax
          >
            <Link
              href={`/journeys/${featuredEntry.slug}`}
              className={styles.journeyIndexFeatureImage}
              aria-label={`${copy.journeys.read}: ${featuredEntry.title}`}
            >
              {featuredEntry.coverImage ? (
                <Image
                  src={featuredEntry.coverImage}
                  alt={featuredEntry.coverAlt}
                  fill
                  loader={getArchiveImageLoader(featuredEntry.coverImage)}
                  priority
                  sizes="(min-width: 901px) 52vw, 92vw"
                  className={styles.imageCover}
                />
              ) : (
                <span className={styles.journeyArchivePlaceholder}>
                  <small>{copy.journeys.coverPending}</small>
                  <strong>{featuredEntry.title}</strong>
                </span>
              )}
            </Link>
            <figcaption className={styles.journeyIndexFeatureCaption}>
              <span>
                J
                {String(
                  featuredIndex >= 0 ? featuredIndex + 1 : 1,
                ).padStart(2, "0")}{" "}
                / {copy.journeys.featuredLabel}
              </span>
              <strong>{featuredEntry.title}</strong>
            </figcaption>
          </figure>
        )}
      </header>

      <div className={styles.journeyArchive}>
        {entries.map((entry, index) => {
          if (entry === featuredEntry) {
            return null;
          }

          return (
            <article
              className={styles.journeyArchiveItem}
              data-motion-reveal
              key={entry.slug}
            >
              <Link
                href={`/journeys/${entry.slug}`}
                className={styles.journeyArchiveImage}
                data-motion-image
                data-motion-parallax
              >
                {entry.coverImage ? (
                  <Image
                    src={entry.coverImage}
                    alt={entry.coverAlt}
                    fill
                    loader={getArchiveImageLoader(entry.coverImage)}
                    sizes="(min-width: 900px) 58vw, 92vw"
                    className={styles.imageCover}
                  />
                ) : (
                  <span className={styles.journeyArchivePlaceholder}>
                    <small>
                      {entry.isDraft
                        ? copy.journeys.coverPending
                        : copy.journeys.fieldNote}
                    </small>
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
          );
        })}
      </div>
    </section>
  );
};
