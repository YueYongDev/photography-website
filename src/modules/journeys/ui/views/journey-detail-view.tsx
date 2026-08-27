import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import type { JourneyMeta } from "@/modules/journeys/data/journeys";
import styles from "@/modules/site/ui/public-site.module.css";

export const JourneyDetailView = ({ journey }: { journey: JourneyMeta }) => {
  return (
    <article className={styles.journeyDetail}>
      <header className={styles.journeyDetailHeader}>
        <Link href="/journeys" className={styles.journeyBack}>
          <ArrowLeft size={14} strokeWidth={1.4} /> All journeys
        </Link>
        <div className={styles.journeyDetailTitle}>
          <div>
            <p className={styles.eyebrow}>{journey.countryCode} / {journey.year}</p>
            <h1>{journey.title}</h1>
          </div>
          <div className={styles.journeyDetailAside}>
            <p>{journey.subtitle}</p>
            <span>{journey.dates}</span>
          </div>
        </div>
      </header>

      <figure className={styles.journeyDetailHero}>
        <Image
          src={journey.coverImage}
          alt={journey.coverAlt}
          fill
          unoptimized
          priority
          sizes="100vw"
          className={styles.imageCover}
        />
        <figcaption>
          <span>{journey.country}</span>
          <span>{journey.route.join(" — ")}</span>
        </figcaption>
      </figure>

      <section className={styles.journeyPrologue}>
        <p className={styles.eyebrow}>Prologue</p>
        <p>{journey.intro}</p>
      </section>

      <div className={styles.journeyChapters}>
        {journey.chapters.map((chapter, index) => (
          <section className={styles.journeyChapter} key={chapter.number}>
            <div className={styles.journeyChapterText}>
              <p className={styles.eyebrow}>{chapter.number} / {chapter.place}</p>
              <h2>{chapter.title}</h2>
              {chapter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {chapter.frame && (
              <figure
                className={`${styles.journeyChapterFrame} ${
                  chapter.frame.format === "portrait" ? styles.journeyChapterFramePortrait : ""
                }`}
              >
                <div>
                  <Image
                    src={chapter.frame.src}
                    alt={chapter.frame.alt}
                    fill
                    unoptimized
                    sizes="(min-width: 900px) 54vw, 92vw"
                    className={styles.imageCover}
                  />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")} / {chapter.frame.location}</span>
                  <span>{chapter.frame.caption}</span>
                </figcaption>
              </figure>
            )}
          </section>
        ))}
      </div>

      {journey.frames.length > 0 && (
        <section className={styles.journeyContactSheet}>
          <div className={styles.journeyContactHead}>
            <p className={styles.eyebrow}>Contact sheet</p>
            <span>{String(journey.frames.length).padStart(2, "0")} frames</span>
          </div>
          <div className={styles.journeyContactGrid}>
            {journey.frames.map((frame, index) => (
              <figure key={frame.src}>
                <div className={frame.format === "portrait" ? styles.journeyContactPortrait : ""}>
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    fill
                    unoptimized
                    sizes="(min-width: 900px) 30vw, 92vw"
                    className={styles.imageCover}
                  />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")} / {frame.location}</span>
                  <span>{frame.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.journeyCoda}>
        <p className={styles.eyebrow}>Coda</p>
        <blockquote>{journey.closing}</blockquote>
        <Link href={`/travel/${journey.countryCode.toLowerCase()}`} className={styles.textLink}>
          Browse {journey.country} by place <ArrowUpRight size={15} strokeWidth={1.4} />
        </Link>
      </footer>
    </article>
  );
};
