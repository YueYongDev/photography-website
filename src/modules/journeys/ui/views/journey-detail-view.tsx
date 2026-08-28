"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import type { JourneyMeta } from "@/modules/journeys/data/journeys";
import {
  localizeJourney,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

export const JourneyDetailView = ({ journey }: { journey: JourneyMeta }) => {
  const { copy, locale } = useSiteLocale();
  const content = useMemo(
    () => localizeJourney(journey, locale),
    [journey, locale],
  );
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const sections = content.chapters
      .map((_, index) => document.getElementById(`journey-chapter-${index}`))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (!first) return;

        const index = Number(
          (first.target as HTMLElement).dataset.chapterIndex,
        );
        if (!Number.isNaN(index)) setActiveChapter(index);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [content.chapters]);

  const openChapter = (index: number) => {
    document
      .getElementById(`journey-chapter-${index}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <article className={styles.journeyDetail}>
      <header className={styles.journeyDetailHeader}>
        <Link href="/journeys" className={styles.journeyBack}>
          <ArrowLeft size={15} strokeWidth={1.4} /> {copy.journey.all}
        </Link>
        <div className={styles.journeyDetailTitle}>
          <div>
            <p className={styles.eyebrow}>
              {content.countryCode} / {content.year}
            </p>
            <h1>{content.title}</h1>
          </div>
          <div className={styles.journeyDetailAside}>
            <p>{content.subtitle}</p>
            <span>{content.dates}</span>
          </div>
        </div>
      </header>

      <figure className={styles.journeyDetailHero}>
        {content.coverImage ? (
          <Image
            src={content.coverImage}
            alt={content.coverAlt}
            fill
            loader={getArchiveImageLoader(content.coverImage)}
            priority
            sizes="100vw"
            className={styles.imageCover}
          />
        ) : (
          <div
            className={styles.journeyDetailHeroPlaceholder}
            role="img"
            aria-label={content.coverAlt}
          >
            <span>{content.countryCode}</span>
            <strong>{copy.journeys.coverPending}</strong>
          </div>
        )}
        <figcaption>
          <span>{content.country}</span>
          <span>{content.route.join(" · ")}</span>
        </figcaption>
      </figure>

      <section className={styles.journeyPrologue}>
        <p className={styles.eyebrow}>{copy.journey.prologue}</p>
        <p>{content.intro}</p>
      </section>

      <div className={styles.journeyReadingLayout}>
        <nav
          className={styles.journeyRouteRail}
          aria-label={copy.journey.route}
        >
          <span>{copy.journey.route}</span>
          {content.chapters.map((chapter, index) => (
            <button
              type="button"
              className={
                index === activeChapter ? styles.journeyRouteActive : ""
              }
              aria-current={index === activeChapter ? "location" : undefined}
              onClick={() => openChapter(index)}
              key={chapter.number}
            >
              <small>{chapter.number}</small>
              <strong>{chapter.place}</strong>
            </button>
          ))}
        </nav>

        <div className={styles.journeyChapters}>
          {content.chapters.map((chapter, index) => (
            <section
              id={`journey-chapter-${index}`}
              className={styles.journeyChapter}
              data-chapter-index={index}
              key={chapter.number}
            >
              <div className={styles.journeyChapterText}>
                <p className={styles.eyebrow}>
                  {chapter.number} / {chapter.place}
                </p>
                <h2>{chapter.title}</h2>
                {chapter.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {chapter.frame && (
                <figure
                  className={`${styles.journeyChapterFrame} ${
                    chapter.frame.format === "portrait"
                      ? styles.journeyChapterFramePortrait
                      : ""
                  }`}
                >
                  <div>
                    <Image
                      src={chapter.frame.src}
                      alt={chapter.frame.alt}
                      fill
                      loader={getArchiveImageLoader(chapter.frame.src)}
                      sizes="(min-width: 900px) 54vw, 92vw"
                      className={styles.imageCover}
                    />
                  </div>
                  <figcaption>
                    <span>
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {chapter.frame.location}
                    </span>
                    <span>{chapter.frame.caption}</span>
                  </figcaption>
                </figure>
              )}
            </section>
          ))}
        </div>
      </div>

      {content.frames.length > 0 && (
        <section className={styles.journeyContactSheet}>
          <div className={styles.journeyContactHead}>
            <p className={styles.eyebrow}>{copy.journey.contactSheet}</p>
            <span>
              {String(content.frames.length).padStart(2, "0")}{" "}
              {copy.common.frames}
            </span>
          </div>
          <div className={styles.journeyContactGrid}>
            {content.frames.map((frame, index) => (
              <figure key={frame.src}>
                <div
                  className={
                    frame.format === "portrait"
                      ? styles.journeyContactPortrait
                      : ""
                  }
                >
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    fill
                    loader={getArchiveImageLoader(frame.src)}
                    sizes="(min-width: 900px) 30vw, 92vw"
                    className={styles.imageCover}
                  />
                </div>
                <figcaption>
                  <span>
                    {String(index + 1).padStart(2, "0")} / {frame.location}
                  </span>
                  <span>{frame.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.journeyCoda}>
        <p className={styles.eyebrow}>{copy.journey.coda}</p>
        <blockquote>{content.closing}</blockquote>
        <Link
          href={`/places/${content.countryCode.toLowerCase()}`}
          className={styles.textLink}
        >
          {copy.journey.browseByPlace(content.country)}{" "}
          <ArrowUpRight size={15} strokeWidth={1.4} />
        </Link>
      </footer>
    </article>
  );
};
