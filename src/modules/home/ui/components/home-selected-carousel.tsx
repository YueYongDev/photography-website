"use client";

import { useState } from "react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import { PhotoViewer } from "@/modules/site/ui/photo-viewer";
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

const getAspectRatio = (photo: HomeSelectedPhoto) =>
  photo.width && photo.height
    ? photo.width / photo.height
    : photo.aspectRatio && photo.aspectRatio > 0
      ? photo.aspectRatio
      : 1.18;

export const HomeSelectedCarousel = ({
  photos,
}: {
  photos: HomeSelectedPhoto[];
}) => {
  const { copy, locale } = useSiteLocale();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const carouselLabel =
    locale === "zh-CN"
      ? `首页照片选集，共 ${photos.length} 张`
      : `Selected photographs, ${photos.length} images`;
  const motionLabel =
    locale === "zh-CN"
      ? "自动向左播放 · 悬停暂停 · 点击放大"
      : "Moving left automatically · Hover to pause · Click to enlarge";

  const renderPhotoSet = (duplicate = false) => (
    <div
      className={`${styles.homeWorkSet} ${
        duplicate ? styles.homeWorkSetDuplicate : ""
      }`}
      aria-hidden={duplicate || undefined}
    >
      {photos.map((entry, photoIndex) => {
        const localizedEntry = copy.home.workEntries[photoIndex];
        const title =
          entry.title || localizedEntry?.title || copy.common.untitled;
        const aspectRatio = Math.max(
          0.58,
          Math.min(getAspectRatio(entry), 2.15),
        );
        const cardStyle = {
          "--home-work-card-width": `clamp(${aspectRatio * 16}rem, ${
            aspectRatio * 22
          }vw, ${aspectRatio * 21}rem)`,
        } as CSSProperties;

        return (
          <figure
            className={styles.homeWorkCard}
            key={`${duplicate ? "duplicate" : "original"}-${entry.id}`}
            style={cardStyle}
          >
            {duplicate ? (
              <div
                className={styles.homeWorkCardButton}
                onClick={() => setActiveIndex(photoIndex)}
              />
            ) : (
              <button
                type="button"
                className={styles.homeWorkCardButton}
                onClick={() => setActiveIndex(photoIndex)}
                aria-label={`${title} · ${
                  locale === "zh-CN" ? "查看大图" : "View original"
                }`}
              />
            )}
            <div className={styles.homeWorkImage}>
              <Image
                src={entry.url}
                alt={duplicate ? "" : title}
                fill
                loader={getArchiveImageLoader(entry.url)}
                placeholder={entry.blurData ? "blur" : "empty"}
                blurDataURL={entry.blurData || undefined}
                sizes="(min-width: 1101px) 32vw, (min-width: 601px) 42vw, 72vw"
                className={styles.imageContain}
              />
            </div>
            <figcaption className={styles.homeWorkMeta}>
              <span>{String(photoIndex + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );

  return (
    <>
      <div
        className={styles.homeWorkCarousel}
        role="region"
        aria-roledescription="carousel"
        aria-label={carouselLabel}
      >
        <div className={styles.homeWorkRail} aria-hidden="true">
          <span>{String(photos.length).padStart(2, "0")} / SELECTION</span>
          <span>{motionLabel}</span>
        </div>

        <div className={styles.homeWorkViewport}>
          <div className={styles.homeWorkTrack}>
            {renderPhotoSet()}
            {renderPhotoSet(true)}
          </div>
        </div>
      </div>

      {activeIndex !== null && (
        <PhotoViewer
          activeIndex={activeIndex}
          context="work"
          contextLabel={copy.home.workTitle}
          photos={photos}
          onClose={() => setActiveIndex(null)}
          onSelect={setActiveIndex}
        />
      )}
    </>
  );
};
