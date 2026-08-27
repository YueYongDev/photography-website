import Image from "next/image";
import Link from "next/link";

import { journeys } from "@/modules/journeys/data/journeys";
import styles from "@/modules/site/ui/public-site.module.css";

const formatDate = (start: string, end?: string) => {
  const startDate = new Date(start);
  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  if (!end) return startLabel;
  const endDate = new Date(end);
  return `${startLabel} — ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })}`;
};

export const JourneysView = () => {
  const [featured, ...archive] = journeys;

  return (
    <>
      <section className={`${styles.page} ${styles.pageMist}`}>
        <p className={styles.eyebrow}>02 / Journeys</p>
        <h1 className={styles.displayTitle}>
          Notes from
          <br />
          <em>the road.</em>
        </h1>
        <p className={styles.lede}>
          Journeys keep the chronology: what happened, who was there, and how
          one frame led to the next. Each live entry opens as its own visual
          field journal.
        </p>

        {featured && (
          <Link href={featured.href} className={styles.journeyFeature}>
            <Image
              src={featured.coverImage}
              alt={featured.title}
              fill
              unoptimized
              priority
              sizes="90vw"
              className={styles.imageCover}
            />
            <div className={styles.journeyShade} />
            <div className={styles.journeyOverlay}>
              <span>{formatDate(featured.startDate, featured.endDate)} · {featured.status}</span>
              <h3>{featured.title}</h3>
            </div>
          </Link>
        )}

        <div className={styles.journeyList}>
          {archive.map((journey, index) => {
            const content = (
              <>
                <span className={styles.journeyRowNumber}>{String(index + 2).padStart(2, "0")}</span>
                <div className={styles.journeyRowImage}>
                  <Image
                    src={journey.coverImage}
                    alt={journey.title}
                    fill
                    unoptimized
                    sizes="(min-width: 900px) 24vw, 90vw"
                    className={styles.imageCover}
                  />
                </div>
                <div>
                  <h3>{journey.title}</h3>
                  <p>{journey.subtitle}. {journey.description}</p>
                </div>
                <span className={styles.journeyRowAside}>
                  {formatDate(journey.startDate, journey.endDate)} · {journey.status}
                </span>
              </>
            );

            return journey.status === "live" ? (
              <Link href={journey.href} className={styles.journeyRow} key={journey.slug}>
                {content}
              </Link>
            ) : (
              <div className={styles.journeyRow} key={journey.slug}>
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};
