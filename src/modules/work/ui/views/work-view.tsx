"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";
import { type Photo, RowsPhotoAlbum } from "react-photo-album";
import PhotoAlbumSSR from "react-photo-album/ssr";
import "react-photo-album/rows.css";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  DEFAULT_CAPTURE_TIMEZONE_OFFSET,
  getCaptureYear,
} from "@/modules/photos/lib/camera-metadata";
import {
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import { PhotoViewer } from "@/modules/site/ui/photo-viewer";
import styles from "@/modules/site/ui/public-site.module.css";

export type WorkPhoto = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  city: string | null;
  countryCode: string | null;
  dateTimeOriginal: Date | string | null;
  captureTimezoneOffset: number;
  blurData: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  updatedAt: Date | string;
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

type WorkAlbumPhoto = Photo & WorkRowItem;

type WorkAlbumLayout = {
  width: number;
  height: number;
};

const buildWorkStory = (photos: WorkPhoto[]) => {
  const items = photos.map((photo, photoIndex) => ({ photo, photoIndex }));
  const leadItem =
    items.find(({ photo }) => getPhotoAspectRatio(photo) >= 1.35) ?? items[0];
  const streamItems = items.filter(
    (item) => item.photo.id !== leadItem?.photo.id,
  );

  return { streamItems, leadItem };
};

const photoYear = (
  value: WorkPhoto["dateTimeOriginal"],
  timezoneOffsetMinutes: number,
  archiveLabel: string,
) => {
  const year = getCaptureYear(value, timezoneOffsetMinutes);
  return year === null ? archiveLabel : String(year);
};

const getWorkTargetRowHeight = (containerWidth: number) =>
  containerWidth <= 600
    ? Math.min(520, containerWidth * 1.2)
    : Math.min(700, Math.max(460, containerWidth / 2.7));

const getWorkSpacing = (containerWidth: number) =>
  containerWidth <= 600
    ? 64
    : Math.round(Math.min(112, Math.max(72, containerWidth * 0.075)));

const workGalleryBreakpoints = [320, 640, 880, 1200, 1600, 2000, 2800];

export const WorkView = ({ photos }: { photos: WorkPhoto[] }) => {
  const { copy, locale } = useSiteLocale();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const years = Array.from(
    new Set(
      photos
        .map((photo) => {
          return getCaptureYear(
            photo.dateTimeOriginal,
            photo.captureTimezoneOffset ?? DEFAULT_CAPTURE_TIMEZONE_OFFSET,
          );
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
  const { streamItems, leadItem } = useMemo(
    () => buildWorkStory(photos),
    [photos],
  );
  const albumPhotos = useMemo<WorkAlbumPhoto[]>(
    () =>
      streamItems.map(({ photo, photoIndex }) => {
        const aspectRatio = getPhotoAspectRatio(photo);
        const hasDimensions = Boolean(
          photo.width && photo.width > 0 && photo.height && photo.height > 0,
        );

        return {
          src: photo.url,
          width: hasDimensions ? photo.width! : Math.round(aspectRatio * 1000),
          height: hasDimensions ? photo.height! : 1000,
          key: photo.id,
          photo,
          photoIndex,
        };
      }),
    [streamItems],
  );
  const renderPhoto = (
    { photo, photoIndex }: WorkRowItem,
    frameClassName = "",
    albumLayout?: WorkAlbumLayout,
  ) => {
    const aspectRatio = getPhotoAspectRatio(photo);
    const title = photo.title || copy.common.untitled;
    const orientationClass = getOrientationClass(aspectRatio);
    const albumStyle = albumLayout
      ? ({
          "--react-photo-album--photo-width": albumLayout.width,
          "--react-photo-album--photo-height": albumLayout.height,
        } as CSSProperties)
      : undefined;
    const albumClassName = albumLayout ? "react-photo-album--photo" : "";

    return (
      <figure
        className={`${albumClassName} ${styles.workFrame} ${orientationClass} ${frameClassName}`}
        data-motion-image
        key={photo.id}
        style={albumStyle}
      >
        <button
          type="button"
          className={styles.workFrameButton}
          data-motion-hover
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
                albumLayout
                  ? `${Math.ceil(albumLayout.width * 1.25)}px`
                  : frameClassName
                    ? "(min-width: 1800px) 112rem, (min-width: 901px) 92vw, 100vw"
                    : "(min-width: 3000px) 56rem, (min-width: 1101px) 31vw, (min-width: 601px) 46vw, 92vw"
              }
              className={styles.imageContain}
            />
          </span>
        </button>
        <figcaption className={styles.workFrameMeta}>
          <strong>{title}</strong>
          <span>
            {photo.city
              ? localizePlaceName(photo.city, locale)
              : copy.work.fieldStudy}{" "}
            · {photoYear(
              photo.dateTimeOriginal,
              photo.captureTimezoneOffset ?? DEFAULT_CAPTURE_TIMEZONE_OFFSET,
              copy.common.archive,
            )}
          </span>
        </figcaption>
      </figure>
    );
  };

  return (
    <section className={`${styles.page} ${styles.workPage}`}>
      <header className={styles.workMasthead}>
        <div className={styles.workMastheadTitle} data-motion-reveal="left">
          <p className={styles.eyebrow}>{copy.work.eyebrow}</p>
          <h1>{copy.work.title}</h1>
        </div>

        <div className={styles.workMastheadAside} data-motion-reveal="right">
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
              <span>{copy.work.startLabel}</span>
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
          <div className={styles.workGalleryArea}>
            <PhotoAlbumSSR breakpoints={workGalleryBreakpoints}>
              <RowsPhotoAlbum
                photos={albumPhotos}
                padding={0}
                spacing={getWorkSpacing}
                targetRowHeight={getWorkTargetRowHeight}
                rowConstraints={(containerWidth) =>
                  containerWidth <= 600
                    ? { minPhotos: 1, maxPhotos: 1 }
                    : {}
                }
                componentsProps={{
                  container: {
                    className: styles.workDynamicGallery,
                    "aria-label": copy.work.title,
                  },
                }}
                render={{
                  photo: (_props, { photo, width, height }) =>
                    renderPhoto(photo, "", { width, height }),
                }}
              />
            </PhotoAlbumSSR>
          </div>
        </div>
      )}

      {activeIndex !== null && (
        <PhotoViewer
          activeIndex={activeIndex}
          context="work"
          contextLabel={copy.work.title}
          photos={photos}
          onClose={() => setActiveIndex(null)}
          onSelect={setActiveIndex}
        />
      )}
    </section>
  );
};
