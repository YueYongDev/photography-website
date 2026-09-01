"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  localizeCountryName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import { HomeJourneysCarousel } from "@/modules/home/ui/components/home-journeys-carousel";
import {
  HomeSelectedCarousel,
  type HomeSelectedPhoto,
} from "@/modules/home/ui/components/home-selected-carousel";
import styles from "@/modules/site/ui/public-site.module.css";

export type { HomeSelectedPhoto } from "@/modules/home/ui/components/home-selected-carousel";

const homePlaces = [
  { name: "New Zealand", code: "NZ", href: "/places/nz" },
  { name: "Uzbekistan", code: "UZ", href: "/places/uz" },
  { name: "Australia", code: "AU", href: "/places/au" },
  { name: "Norway", code: "NO", href: "/places/no" },
  { name: "Iceland", code: "IS", href: "/places/is" },
  { name: "Japan", code: "JP", href: "/places/jp" },
  { name: "United Kingdom", code: "GB", href: "/places/gb" },
] as const;

export const HomeView = ({
  selectedPhotos,
}: {
  selectedPhotos: HomeSelectedPhoto[];
}) => {
  const { copy, locale } = useSiteLocale();

  return (
    <>
      <section className={`${styles.page} ${styles.homeHero}`}>
        <div className={styles.homeHeroCopy} data-motion-reveal="left">
          <p className={styles.eyebrow}>{copy.home.eyebrow}</p>
          <h1 className={styles.displayTitle}>
            {copy.home.titleStart}
            <br />
            <em>{copy.home.titleEnd}</em>
          </h1>
        </div>

        <figure
          className={styles.homeHeroFigure}
          data-motion-image
          data-motion-parallax
        >
          <div className={styles.homeHeroImage}>
            <Image
              src="/404.webp"
              alt={copy.home.heroAlt}
              fill
              priority
              sizes="(min-width: 900px) 42vw, 92vw"
              className={styles.imageCover}
            />

            <span className={styles.homeHeroPhotoIndex} aria-hidden="true">
              HKG / 01
            </span>
          </div>
          <figcaption className={styles.imageCaption}>
            <span>{copy.home.heroCaption}</span>
            <span>{locale === "zh-CN" ? "香港" : "Hong Kong"}</span>
          </figcaption>
        </figure>
      </section>

      <section
        className={`${styles.section} ${styles.sectionWhite} ${styles.homeWorkSection}`}
      >
        <div className={styles.sectionHead} data-motion-reveal="left">
          <p className={styles.eyebrow}>{copy.home.workEyebrow}</p>
          <h2>{copy.home.workTitle}</h2>
        </div>

        {selectedPhotos.length === 0 ? (
          <div className={styles.archiveEmpty}>
            <span>00</span>
            <div>
              <h3>{copy.work.emptyTitle}</h3>
            </div>
          </div>
        ) : (
          <div className={styles.homeWorkGallery} data-motion-reveal>
            <HomeSelectedCarousel photos={selectedPhotos} />

            <div className={styles.homeWorkFooter}>
              <Link href="/work" className={styles.textLink}>
                {copy.home.workLink}{" "}
                <ArrowUpRight size={15} strokeWidth={1.4} />
              </Link>
            </div>
          </div>
        )}
      </section>

      <section
        className={`${styles.section} ${styles.sectionMist} ${styles.homeJourneysSection}`}
      >
        <div className={styles.sectionHead} data-motion-reveal="left">
          <p className={styles.eyebrow}>{copy.home.journeysEyebrow}</p>
          <h2>{copy.home.journeysTitle}</h2>
        </div>

        <div className={styles.homeJourneyContent} data-motion-reveal>
          <HomeJourneysCarousel />
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionWhite} ${styles.homePlacesSection}`}
      >
        <div className={styles.homePlacesHead} data-motion-reveal="left">
          <p className={styles.eyebrow}>{copy.home.travelEyebrow}</p>
          <h2>{copy.home.travelTitle}</h2>
        </div>

        <div className={styles.homePlacesList} data-motion-reveal="right">
          <div className={styles.atlasLines}>
            {homePlaces.map((country, index) => (
              <Link
                href={country.href}
                className={styles.atlasLine}
                data-motion-hover
                key={country.name}
              >
                <span>T{String(index + 1).padStart(2, "0")}</span>
                <strong>
                  {localizeCountryName(country.name, country.code, locale)}
                </strong>
                <ArrowUpRight size={15} strokeWidth={1.4} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
