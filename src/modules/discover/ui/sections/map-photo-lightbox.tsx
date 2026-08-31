"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

import BlurImage from "@/components/blur-image";
import type { Photo } from "@/db/schema/photos";
import { formatExposureTime } from "@/lib/utils";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "./map-experience.module.css";

type Props = {
  activeIndex: number;
  photos: Photo[];
  onClose: () => void;
  onSelect: (index: number) => void;
};

export const MapPhotoLightbox = ({
  activeIndex,
  photos,
  onClose,
  onSelect,
}: Props) => {
  const { copy, locale } = useSiteLocale();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const photo = photos[activeIndex];

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" && photos.length > 1) {
        event.preventDefault();
        onSelect((activeIndex - 1 + photos.length) % photos.length);
        return;
      }

      if (event.key === "ArrowRight" && photos.length > 1) {
        event.preventDefault();
        onSelect((activeIndex + 1) % photos.length);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          "button:not([disabled])",
        ) ?? [],
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, onSelect, photos.length]);

  if (!photo) return null;

  const aspectRatio =
    photo.width > 0 && photo.height > 0
      ? photo.width / photo.height
      : photo.aspectRatio > 0
        ? photo.aspectRatio
        : 3 / 2;
  const title = photo.title || copy.common.untitled;
  const location =
    photo.placeFormatted ||
    [
      photo.city ? localizePlaceName(photo.city, locale) : null,
      photo.country
        ? localizeCountryName(photo.country, photo.countryCode, locale)
        : null,
    ]
      .filter(Boolean)
      .join(locale === "zh-CN" ? "，" : ", ");
  const date = photo.dateTimeOriginal
    ? new Date(photo.dateTimeOriginal).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const camera = [photo.make, photo.model].filter(Boolean).join(" ");
  const focalLength = photo.focalLength35mm ?? photo.focalLength;
  const specs = [
    camera ? [copy.photo.camera, camera] : null,
    photo.lensModel ? [copy.photo.lens, photo.lensModel] : null,
    focalLength ? [copy.photo.focalLength, `${focalLength}mm`] : null,
    photo.fNumber ? [copy.photo.aperture, `ƒ/${photo.fNumber}`] : null,
    photo.exposureTime
      ? [copy.photo.exposure, formatExposureTime(photo.exposureTime)]
      : null,
    photo.iso ? [copy.photo.sensitivity, `ISO ${photo.iso}`] : null,
    date ? [copy.photo.date, date] : null,
  ].filter((spec): spec is [string, string] => Boolean(spec));

  const stopPropagation = (event: ReactMouseEvent) => event.stopPropagation();

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.photoLightbox}
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-photo-lightbox-title"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className={styles.photoLightboxClose}
        aria-label={copy.map.closePhoto}
        onClick={onClose}
      >
        <span>{copy.map.close}</span>
        <X size={20} strokeWidth={1.25} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.photoLightboxNav} ${styles.photoLightboxPrevious}`}
            aria-label={copy.map.previousPhoto}
            onClick={(event) => {
              stopPropagation(event);
              onSelect((activeIndex - 1 + photos.length) % photos.length);
            }}
          >
            <ChevronLeft size={28} strokeWidth={1.1} />
          </button>
          <button
            type="button"
            className={`${styles.photoLightboxNav} ${styles.photoLightboxNext}`}
            aria-label={copy.map.nextPhoto}
            onClick={(event) => {
              stopPropagation(event);
              onSelect((activeIndex + 1) % photos.length);
            }}
          >
            <ChevronRight size={28} strokeWidth={1.1} />
          </button>
        </>
      )}

      <figure
        className={styles.photoLightboxFigure}
        data-orientation={aspectRatio < 1 ? "portrait" : "landscape"}
        style={
          {
            "--map-photo-ratio": aspectRatio,
          } as CSSProperties
        }
        onClick={stopPropagation}
      >
        <div className={styles.photoLightboxImageFrame}>
          <BlurImage
            key={photo.id}
            src={photo.url}
            alt={title}
            fill
            priority
            quality={75}
            blurhash={photo.blurData}
            sizes="(max-width: 760px) 96vw, 92vw"
            className={styles.photoLightboxImage}
          />
        </div>

        <figcaption className={styles.photoLightboxCaption}>
          <div className={styles.photoLightboxTitle}>
            <p>
              {copy.photo.photograph} /{" "}
              {String(activeIndex + 1).padStart(2, "0")} —{" "}
              {String(photos.length).padStart(2, "0")}
            </p>
            <h2 id="map-photo-lightbox-title">{title}</h2>
          </div>

          {(specs.length > 0 || location) && (
            <div className={styles.photoLightboxDetails}>
              {specs.length > 0 && (
                <dl className={styles.photoLightboxSpecs}>
                  {specs.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {location && (
                <dl className={styles.photoLightboxLocation}>
                  <div>
                    <dt>{copy.common.place}</dt>
                    <dd>{location}</dd>
                  </div>
                </dl>
              )}
            </div>
          )}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
};
