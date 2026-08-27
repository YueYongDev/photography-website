"use client";

import Image from "next/image";
import Link from "next/link";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

export type WorkPhoto = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  city: string | null;
  countryCode: string | null;
  dateTimeOriginal: Date | string | null;
  blurData: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  updatedAt: Date | string;
  sequence: number;
};

const getOrientation = (aspectRatio: number) => {
  if (aspectRatio < 0.92) return "portrait";
  if (aspectRatio > 1.12) return "landscape";
  return "square";
};

const photoYear = (
  value: WorkPhoto["dateTimeOriginal"],
  archiveLabel: string,
) => {
  if (!value) return archiveLabel;
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? archiveLabel : String(year);
};

export const WorkView = ({ photos }: { photos: WorkPhoto[] }) => {
  const { copy, locale } = useSiteLocale();

  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>{copy.work.eyebrow}</p>
      <h1 className={styles.displayTitle}>
        {copy.work.titleStart}
        <br />
        <em>{copy.work.titleEnd}</em>
      </h1>

      {photos.length === 0 ? (
        <div className={styles.archiveEmpty}>
          <span>00</span>
          <div>
            <h2>{copy.work.emptyTitle}</h2>
          </div>
        </div>
      ) : (
        <div className={styles.workGrid}>
          {photos.map((photo) => {
            const aspectRatio =
              photo.width && photo.height
                ? photo.width / photo.height
                : photo.aspectRatio && photo.aspectRatio > 0
                  ? photo.aspectRatio
                  : 1.5;
            const orientation = getOrientation(aspectRatio);
            const orientationClass =
              orientation === "portrait"
                ? styles.workFramePortrait
                : orientation === "square"
                  ? styles.workFrameSquare
                  : styles.workFrameLandscape;
            const title = photo.title || copy.common.untitled;
            const frame = (
              <>
                <div className={styles.workFrameImage} style={{ aspectRatio }}>
                  <Image
                    src={photo.url}
                    alt={title || copy.work.selectedAlt}
                    fill
                    loader={getArchiveImageLoader(photo.url)}
                    placeholder={photo.blurData ? "blur" : "empty"}
                    blurDataURL={photo.blurData || undefined}
                    sizes="(min-width: 900px) 46vw, 92vw"
                    className={styles.imageContain}
                  />
                </div>
                <div className={styles.workFrameMeta}>
                  <strong>
                    {String(photo.sequence).padStart(2, "0")} / {title}
                  </strong>
                  <span>
                    {photo.city
                      ? localizePlaceName(photo.city, locale)
                      : copy.work.fieldStudy}{" "}
                    · {photoYear(photo.dateTimeOriginal, copy.common.archive)}
                  </span>
                </div>
              </>
            );

            return (
              <Link
                href={`/photograph/${photo.id}`}
                className={`${styles.workFrame} ${orientationClass}`}
                key={photo.id}
              >
                {frame}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
