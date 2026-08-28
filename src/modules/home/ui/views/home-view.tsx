"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizeCountryName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import { HomeJourneysCarousel } from "@/modules/home/ui/components/home-journeys-carousel";
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

const getHomeWorkOrientationClass = (aspectRatio: number) => {
  if (aspectRatio < 0.96) return styles.homeWorkCardPortrait;
  if (aspectRatio <= 1.08) return styles.homeWorkCardSquare;
  return styles.homeWorkCardLandscape;
};

const getHomeWorkAspectRatio = (photo: HomeSelectedPhoto) =>
  photo.width && photo.height
    ? photo.width / photo.height
    : photo.aspectRatio && photo.aspectRatio > 0
      ? photo.aspectRatio
      : 1.18;

const getHomeWorkGalleryStyle = (aspectRatios: number[]): CSSProperties => {
  const totalAspectRatio = aspectRatios.reduce(
    (total, aspectRatio) => total + aspectRatio,
    0,
  );
  const totalGapRem = Math.max(0, aspectRatios.length - 1);

  return {
    maxWidth: `${Math.min(
      104,
      totalAspectRatio * 32 + totalGapRem,
    )}rem`,
  };
};

export const HomeView = ({
  selectedPhotos,
}: {
  selectedPhotos: HomeSelectedPhoto[];
}) => {
  const { copy, locale } = useSiteLocale();
  const selectedPhotoAspectRatios = selectedPhotos.map(getHomeWorkAspectRatio);

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

      <section
        className={`${styles.section} ${styles.sectionWhite} ${styles.homeWorkSection}`}
      >
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
          <div
            className={styles.homeWorkGallery}
            style={getHomeWorkGalleryStyle(selectedPhotoAspectRatios)}
          >
            <div
              className={styles.homeWorkGrid}
              style={{
                gridTemplateColumns: selectedPhotoAspectRatios
                  .map((aspectRatio) => `${aspectRatio}fr`)
                  .join(" "),
              }}
            >
              {selectedPhotos.map((entry, index) => {
                const localizedEntry = copy.home.workEntries[index];
                const title =
                  entry.title || localizedEntry?.title || copy.common.untitled;
                const aspectRatio = selectedPhotoAspectRatios[index];
                const cardStyle = {
                  "--home-work-narrow-width": `${Math.min(
                    48,
                    aspectRatio * 30,
                  )}rem`,
                } as CSSProperties;

                return (
                  <Link
                    href={`/photograph/${entry.id}`}
                    className={`${styles.homeWorkCard} ${getHomeWorkOrientationClass(aspectRatio)}`}
                    key={entry.id}
                    style={cardStyle}
                  >
                    <div
                      className={styles.homeWorkImage}
                      style={{ aspectRatio }}
                    >
                      <Image
                        src={entry.url}
                        alt={title}
                        fill
                        loader={getArchiveImageLoader(entry.url)}
                        placeholder={entry.blurData ? "blur" : "empty"}
                        blurDataURL={entry.blurData || undefined}
                        sizes="(min-width: 1101px) 34vw, 88vw"
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
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>{copy.home.journeysEyebrow}</p>
          <h2>{copy.home.journeysTitle}</h2>
        </div>

        <HomeJourneysCarousel />
      </section>

      <section
        className={`${styles.section} ${styles.sectionWhite} ${styles.homePlacesSection}`}
      >
        <div className={styles.homePlacesHead}>
          <p className={styles.eyebrow}>{copy.home.travelEyebrow}</p>
          <h2>{copy.home.travelTitle}</h2>
        </div>

        <div className={styles.homePlacesList}>
          <div className={styles.atlasLines}>
            {[
              { name: "New Zealand", code: "NZ", href: "/places/nz" },
              { name: "Uzbekistan", code: "UZ", href: "/places/uz" },
              { name: "Australia", code: "AU", href: "/places/au" },
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
