"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizeCountryName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

export type HomeSelectedPhoto = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  blurData: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
};

export const HomeView = ({
  selectedPhotos,
}: {
  selectedPhotos: HomeSelectedPhoto[];
}) => {
  const { copy, locale } = useSiteLocale();

  return (
    <>
      <section className={`${styles.page} ${styles.homeHero}`}>
        <div className={styles.homeHeroCopy}>
          <p className={styles.eyebrow}>{copy.home.eyebrow}</p>
          <h1 className={styles.displayTitle}>
            {copy.home.titleStart}
            <br />
            <em>{copy.home.titleEnd}</em>
          </h1>
        </div>

        <figure className={styles.homeHeroFigure}>
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

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionHead}>
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
          <div className={styles.homeWorkGrid}>
            {selectedPhotos.map((entry, index) => {
              const localizedEntry = copy.home.workEntries[index];
              const title =
                entry.title || localizedEntry?.title || copy.common.untitled;
              const aspectRatio =
                entry.width && entry.height
                  ? entry.width / entry.height
                  : entry.aspectRatio && entry.aspectRatio > 0
                    ? entry.aspectRatio
                    : 1.18;
              return (
                <Link
                  href={`/photograph/${entry.id}`}
                  className={styles.homeWorkCard}
                  key={entry.id}
                >
                  <div className={styles.homeWorkImage} style={{ aspectRatio }}>
                    <Image
                      src={entry.url}
                      alt={title}
                      fill
                      loader={getArchiveImageLoader(entry.url)}
                      placeholder={entry.blurData ? "blur" : "empty"}
                      blurDataURL={entry.blurData || undefined}
                      sizes="(min-width: 900px) 45vw, 90vw"
                      className={styles.imageContain}
                    />
                  </div>
                  <div className={styles.homeWorkMeta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "5rem" }}>
          <Link href="/work" className={styles.textLink}>
            {copy.home.workLink} <ArrowUpRight size={15} strokeWidth={1.4} />
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMist}`}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{copy.home.journeysEyebrow}</p>
          <h2>{copy.home.journeysTitle}</h2>
        </div>

        <Link
          href="/journeys/newzealand-2026"
          className={styles.journeyFeature}
        >
          <Image
            src="/journeys/newzealand-2026/photos/01-cover-mt-cook.jpg"
            alt={
              locale === "zh-CN"
                ? "通往奥拉基的公路，新西兰南岛 2026 旅行记录"
                : "New Zealand 2026 journey"
            }
            fill
            sizes="90vw"
            className={styles.imageCover}
          />
          <div className={styles.journeyShade} />
          <div className={styles.journeyOverlay}>
            <span>{copy.home.journalMeta}</span>
            <h3>{copy.home.journalTitle}</h3>
          </div>
        </Link>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{copy.home.travelEyebrow}</p>
          <h2>{copy.home.travelTitle}</h2>
        </div>

        <div className={styles.atlasTeaser}>
          <h3>{copy.home.travelPrompt}</h3>
          <div className={styles.atlasLines}>
            {[
              { name: "New Zealand", code: "NZ", href: "/travel/nz" },
              { name: "Uzbekistan", code: "UZ", href: "/travel/uz" },
              { name: "Australia", code: "AU", href: "/travel/au" },
            ].map((country, index) => (
              <Link
                href={country.href}
                className={styles.atlasLine}
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
