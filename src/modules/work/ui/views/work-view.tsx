"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useCallback, useState } from "react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";
import { WorkLightbox } from "@/modules/work/ui/components/work-lightbox";

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

const getOrientationClass = (aspectRatio: number) => {
  if (aspectRatio < 0.96) return styles.workFramePortrait;
  if (aspectRatio <= 1.08) return styles.workFrameSquare;
  return styles.workFrameLandscape;
};

const getPhotoAspectRatio = (photo: WorkPhoto) =>
  photo.width && photo.height
    ? photo.width / photo.height
    : photo.aspectRatio && photo.aspectRatio > 0
      ? photo.aspectRatio
      : 1.5;

type WorkRowItem = {
  photo: WorkPhoto;
  photoIndex: number;
};

const buildWorkStory = (photos: WorkPhoto[]) => {
  const items = photos.map((photo, photoIndex) => ({ photo, photoIndex }));
  const leadItem =
    items.find(({ photo }) => getPhotoAspectRatio(photo) >= 1.35) ?? items[0];
  const columns: [WorkRowItem[], WorkRowItem[]] = [[], []];
  const columnWeights = [0, 0];

  items.forEach((item) => {
    if (item.photo.id === leadItem?.photo.id) return;

    const columnIndex = columnWeights[0] <= columnWeights[1] ? 0 : 1;
    columns[columnIndex].push(item);
    columnWeights[columnIndex] += 1 / getPhotoAspectRatio(item.photo) + 0.18;
  });

  return { columns, leadItem };
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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const years = Array.from(
    new Set(
      photos
        .map((photo) => {
          if (!photo.dateTimeOriginal) return null;
          const year = new Date(photo.dateTimeOriginal).getFullYear();
          return Number.isNaN(year) ? null : year;
        })
        .filter((year): year is number => year !== null),
    ),
  ).sort((first, second) => first - second);
  const firstYear = years.at(0);
  const lastYear = years.at(-1);
  const yearRange =
    firstYear === undefined || lastYear === undefined
      ? copy.common.notRecorded
      : firstYear === lastYear
        ? String(firstYear)
        : locale === "zh-CN"
          ? `${firstYear} 至 ${lastYear}`
          : `${firstYear}–${lastYear}`;
  const placesCount = new Set(
    photos
      .map((photo) => {
        const city = photo.city?.trim();
        const country = photo.countryCode?.trim().toUpperCase();
        if (city) return `${country || ""}/${city.toLowerCase()}`;
        return country || null;
      })
      .filter((place): place is string => Boolean(place)),
  ).size;
  const { columns, leadItem } = buildWorkStory(photos);
  const startLabel = leadItem
    ? copy.work.startLabel.replace(
        "01",
        String(leadItem.photo.sequence).padStart(2, "0"),
      )
    : copy.work.startLabel;

  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const showPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null || photos.length === 0) return currentIndex;
      return (currentIndex - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);
  const showNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null || photos.length === 0) return currentIndex;
      return (currentIndex + 1) % photos.length;
    });
  }, [photos.length]);

  const renderPhoto = (
    { photo, photoIndex }: WorkRowItem,
    frameClassName = "",
  ) => {
    const aspectRatio = getPhotoAspectRatio(photo);
    const title = photo.title || copy.common.untitled;
    const orientationClass = getOrientationClass(aspectRatio);

    return (
      <figure
        className={`${styles.workFrame} ${orientationClass} ${frameClassName}`}
        key={photo.id}
      >
        <button
          type="button"
          className={styles.workFrameButton}
          onClick={() => setActiveIndex(photoIndex)}
          aria-label={`${title} · ${
            locale === "zh-CN" ? "查看原图" : "View original"
          }`}
        >
          <span className={styles.workFrameImage} style={{ aspectRatio }}>
            <Image
              src={photo.url}
              alt={title || copy.work.selectedAlt}
              fill
              loader={getArchiveImageLoader(photo.url)}
              placeholder={photo.blurData ? "blur" : "empty"}
              blurDataURL={photo.blurData || undefined}
              sizes={
                frameClassName
                  ? "100vw"
                  : "(min-width: 901px) 43vw, 92vw"
              }
              className={styles.imageContain}
            />
          </span>
        </button>
        <figcaption className={styles.workFrameMeta}>
          <strong>
            {String(photo.sequence).padStart(2, "0")} / {title}
          </strong>
          <span>
            {photo.city
              ? localizePlaceName(photo.city, locale)
              : copy.work.fieldStudy}{" "}
            · {photoYear(photo.dateTimeOriginal, copy.common.archive)}
          </span>
        </figcaption>
      </figure>
    );
  };

  return (
    <section className={`${styles.page} ${styles.workPage}`}>
      <header className={styles.workMasthead}>
        <div className={styles.workMastheadTitle}>
          <p className={styles.eyebrow}>{copy.work.eyebrow}</p>
          <h1>{copy.work.title}</h1>
        </div>

        <div className={styles.workMastheadAside}>
          <p>{copy.work.description}</p>
          {copy.work.attribution && (
            <cite className={styles.workMastheadAttribution}>
              {copy.work.attribution}
            </cite>
          )}

          <dl className={styles.workMastheadStats}>
            <div>
              <dt>{copy.work.photographsLabel}</dt>
              <dd>{String(photos.length).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>{copy.work.yearsLabel}</dt>
              <dd>{yearRange}</dd>
            </div>
            <div>
              <dt>{copy.work.placesLabel}</dt>
              <dd>{String(placesCount).padStart(2, "0")}</dd>
            </div>
          </dl>

          {photos.length > 0 && (
            <a className={styles.workMastheadJump} href="#work-selection">
              <span>{startLabel}</span>
              <ArrowDown aria-hidden="true" size={18} strokeWidth={1.4} />
            </a>
          )}
        </div>
      </header>

      {photos.length === 0 ? (
        <div className={styles.archiveEmpty}>
          <span>00</span>
          <div>
            <h2>{copy.work.emptyTitle}</h2>
          </div>
        </div>
      ) : (
        <div className={styles.workGrid} id="work-selection">
          {leadItem && renderPhoto(leadItem, styles.workLead)}
          <div className={styles.workColumns}>
            {columns.map((column, columnIndex) => (
              <div className={styles.workColumn} key={columnIndex}>
                {column.map((item) => renderPhoto(item))}
              </div>
            ))}
          </div>
          <div className={styles.workMobileStream}>
            {photos.map((photo, photoIndex) =>
              photo.id === leadItem?.photo.id
                ? null
                : renderPhoto({ photo, photoIndex }),
            )}
          </div>
        </div>
      )}

      {activeIndex !== null && (
        <WorkLightbox
          activeIndex={activeIndex}
          locale={locale}
          photos={photos}
          onClose={closeLightbox}
          onPrevious={showPrevious}
          onNext={showNext}
        />
      )}
    </section>
  );
};
