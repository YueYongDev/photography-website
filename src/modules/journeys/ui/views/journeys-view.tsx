import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { journeys } from "@/modules/journeys/data/journeys";
import styles from "@/modules/site/ui/public-site.module.css";

export const JourneysView = () => {
  return (
    <section className={`${styles.page} ${styles.pageMist}`}>
      <div className={styles.journeyIndexIntro}>
        <div>
          <p className={styles.eyebrow}>02 / Journeys</p>
          <h1 className={styles.displayTitle}>
            Stories that need
            <br />
            <em>more than one frame.</em>
          </h1>
        </div>
        <p className={styles.lede}>
          Journeys are the longer form of the archive: route, sequence, notes,
          and photographs kept together as one story. Every entry now lives
          here, inside the same site.
        </p>
      </div>

      <div className={styles.journeyArchive}>
        {journeys.map((journey, index) => (
          <article className={styles.journeyArchiveItem} key={journey.slug}>
            <Link href={`/journeys/${journey.slug}`} className={styles.journeyArchiveImage}>
              <Image
                src={journey.coverImage}
                alt={journey.coverAlt}
                fill
                unoptimized
                priority={index === 0}
                sizes="(min-width: 900px) 58vw, 92vw"
                className={styles.imageCover}
              />
            </Link>

            <div className={styles.journeyArchiveCopy}>
              <span className={styles.journeyArchiveNumber}>
                J{String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className={styles.journeyArchiveMeta}>
                  {journey.country} · {journey.dates}
                </p>
                <h2>{journey.title}</h2>
                <p>{journey.description}</p>
                <div className={styles.journeyRoute}>
                  {journey.route.map((place) => <span key={place}>{place}</span>)}
                </div>
                <Link href={`/journeys/${journey.slug}`} className={styles.textLink}>
                  Read the journey <ArrowUpRight size={15} strokeWidth={1.4} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
