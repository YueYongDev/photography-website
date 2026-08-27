import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import styles from "@/modules/site/ui/public-site.module.css";

const workEntries = [
  {
    number: "01",
    title: "Quiet Distances",
    description: "Scale, weather, and the measured silence between a person and the horizon.",
    image: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
  },
  {
    number: "02",
    title: "Passing Through",
    description: "Roads, windows, borrowed viewpoints, and the landscape seen in transit.",
    image: "/journeys/newzealand-2026/photos/03-lindis-road.jpg",
  },
  {
    number: "03",
    title: "The Observer",
    description: "People looking, making, and becoming part of the scene they came to witness.",
    image: "/journeys/newzealand-2026/photos/06-tekapo-portrait.jpg",
  },
];

export const HomeView = () => {
  return (
    <>
      <section className={styles.page}>
        <p className={styles.eyebrow}>Photography by YueYong</p>
        <h1 className={styles.displayTitle}>
          Photography,
          <br />
          shaped <em>along the way.</em>
        </h1>
        <p className={styles.lede}>
          Places become the setting. Attention becomes the work — an evolving
          archive of distance, human traces, and quiet moments in motion.
        </p>

        <figure>
          <div className={styles.heroImage}>
            <Image
              src="/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg"
              alt="A solitary figure beside Lake Tekapo"
              fill
              unoptimized
              priority
              sizes="(min-width: 900px) 60vw, 87vw"
              className={styles.imageCover}
            />
          </div>
          <figcaption
            className={`${styles.imageCaption} ${styles.heroCaption}`}
          >
            <span>Quiet Distances, No. 04</span>
            <span>Tekapo · 2026</span>
          </figcaption>
        </figure>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>01 / Selected Work</p>
          <h2>Recurring ways of seeing.</h2>
          <p>
            A small, edited set of visual questions. Places change; the things
            I return to remain.
          </p>
        </div>

        <div className={styles.homeWorkGrid}>
          {workEntries.map((entry) => (
            <Link href="/work" className={styles.homeWorkCard} key={entry.number}>
              <div className={styles.homeWorkImage}>
                <Image
                  src={entry.image}
                  alt={entry.title}
                  fill
                  unoptimized
                  sizes="(min-width: 900px) 45vw, 90vw"
                  className={styles.imageCover}
                />
              </div>
              <div className={styles.homeWorkMeta}>
                <span>{entry.number}</span>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: "5rem" }}>
          <Link href="/work" className={styles.textLink}>
            View selected work <ArrowUpRight size={15} strokeWidth={1.4} />
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMist}`}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>02 / Journeys</p>
          <h2>Notes from the road.</h2>
          <p>
            Chronology, route, people, and field notes — the longer story around
            the photographs.
          </p>
        </div>

        <Link href="/journeys/newzealand-2026" className={styles.journeyFeature}>
          <Image
            src="/journeys/newzealand-2026/photos/01-cover-mt-cook.jpg"
            alt="New Zealand 2026 journey"
            fill
            unoptimized
            sizes="90vw"
            className={styles.imageCover}
          />
          <div className={styles.journeyShade} />
          <div className={styles.journeyOverlay}>
            <span>Field journal · 26 April — 02 May 2026</span>
            <h3>New Zealand 2026</h3>
          </div>
        </Link>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>03 / Travel</p>
          <h2>Countries first. Places within.</h2>
          <p>
            Travel is kept at the scale of a country, while individual cities
            remain available inside each archive and on the map.
          </p>
        </div>

        <div className={styles.atlasTeaser}>
          <h3>A broader view of where the work began.</h3>
          <div className={styles.atlasLines}>
            {[
              { name: "New Zealand", href: "/travel/nz" },
              { name: "Uzbekistan", href: "/travel/uz" },
              { name: "Australia", href: "/travel/au" },
            ].map((country, index) => (
              <Link href={country.href} className={styles.atlasLine} key={country.name}>
                <span>T{String(index + 1).padStart(2, "0")}</span>
                <strong>{country.name}</strong>
                <ArrowUpRight size={15} strokeWidth={1.4} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
