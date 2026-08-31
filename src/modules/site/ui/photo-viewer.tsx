"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";

import BlurImage from "@/components/blur-image";
import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

export type PhotoViewerContext = "work" | "place" | "map";

export type PhotoViewerSpec = {
  label: string;
  value: string;
};

export type PhotoViewerItem = {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  date?: string | null;
  blurData?: string | null;
  width?: number | null;
  height?: number | null;
  aspectRatio?: number | null;
  specs?: PhotoViewerSpec[];
};

type Props = {
  activeIndex: number;
  actionHref?: string;
  actionLabel?: string;
  context: PhotoViewerContext;
  contextLabel?: string;
  photos: PhotoViewerItem[];
  onClose: () => void;
  onSelect: (index: number) => void;
  wrap?: boolean;
};

const getAspectRatio = (photo: PhotoViewerItem) =>
  photo.width && photo.height
    ? photo.width / photo.height
    : photo.aspectRatio && photo.aspectRatio > 0
      ? photo.aspectRatio
      : 3 / 2;

export const PhotoViewer = ({
  activeIndex,
  actionHref,
  actionLabel,
  context,
  contextLabel,
  photos,
  onClose,
  onSelect,
  wrap = true,
}: Props) => {
  const { copy, locale } = useSiteLocale();
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pointerStartRef = useRef<number | null>(null);
  const photo = photos[activeIndex];
  const hasPrevious = wrap ? photos.length > 1 : activeIndex > 0;
  const hasNext = wrap
    ? photos.length > 1
    : activeIndex < Math.max(photos.length - 1, 0);

  const selectPrevious = useCallback(() => {
    if (!hasPrevious) return;
    onSelect(
      wrap
        ? (activeIndex - 1 + photos.length) % photos.length
        : activeIndex - 1,
    );
  }, [activeIndex, hasPrevious, onSelect, photos.length, wrap]);

  const selectNext = useCallback(() => {
    if (!hasNext) return;
    onSelect(wrap ? (activeIndex + 1) % photos.length : activeIndex + 1);
  }, [activeIndex, hasNext, onSelect, photos.length, wrap]);

  useEffect(() => setMounted(true), []);

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
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
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

      if (event.key === "ArrowLeft" && hasPrevious) {
        event.preventDefault();
        selectPrevious();
        return;
      }

      if (event.key === "ArrowRight" && hasNext) {
        event.preventDefault();
        selectNext();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), summary, a[href]",
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
  }, [hasNext, hasPrevious, onClose, selectNext, selectPrevious]);

  useEffect(() => {
    if (photos.length < 2) return;

    const adjacentIndexes = [
      (activeIndex - 1 + photos.length) % photos.length,
      (activeIndex + 1) % photos.length,
    ];
    adjacentIndexes.forEach((index) => {
      const image = new window.Image();
      image.src = photos[index]?.url ?? "";
    });
  }, [activeIndex, photos]);

  if (!mounted || !photo) return null;

  const title = photo.title || copy.common.untitled;
  const aspectRatio = getAspectRatio(photo);
  const detailsLabel = locale === "zh-CN" ? "拍摄信息" : "Photograph details";
  const dialogLabel =
    locale === "zh-CN" ? `${title}，照片查看器` : `${title}, photograph viewer`;
  const contextName =
    contextLabel ||
    (context === "work"
      ? copy.work.title
      : context === "map"
        ? copy.map.mappedArchive
        : copy.navigation.travel);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      pointerStartRef.current = event.clientX;
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || pointerStartRef.current === null) {
      return;
    }

    const distance = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;
    if (Math.abs(distance) < 44) return;
    if (distance > 0) selectPrevious();
    else selectNext();
  };

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.photoViewer}
      data-context={context}
      data-locale={locale}
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
      onClick={onClose}
    >
      <header className={styles.photoViewerHeader}>
        <p>{contextName}</p>
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.photoViewerClose}
          aria-label={copy.map.closePhoto}
          onClick={onClose}
        >
          <span>{copy.map.close}</span>
          <X size={20} strokeWidth={1.2} />
        </button>
      </header>

      {hasPrevious && (
        <button
          type="button"
          className={`${styles.photoViewerNav} ${styles.photoViewerPrevious}`}
          aria-label={copy.map.previousPhoto}
          onClick={(event) => {
            event.stopPropagation();
            selectPrevious();
          }}
        >
          <ChevronLeft size={29} strokeWidth={1.05} />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          className={`${styles.photoViewerNav} ${styles.photoViewerNext}`}
          aria-label={copy.map.nextPhoto}
          onClick={(event) => {
            event.stopPropagation();
            selectNext();
          }}
        >
          <ChevronRight size={29} strokeWidth={1.05} />
        </button>
      )}

      <div
        className={styles.photoViewerStage}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <figure
          className={styles.photoViewerFigure}
          style={
            {
              "--photo-viewer-ratio": aspectRatio,
            } as CSSProperties
          }
        >
          <div className={styles.photoViewerImageFrame}>
            <BlurImage
              key={photo.id}
              src={photo.url}
              alt={title}
              fill
              priority
              quality={82}
              blurhash={photo.blurData || ""}
              sizes="(max-width: 760px) 96vw, 90vw"
              className={styles.imageContain}
            />
          </div>

          <figcaption className={styles.photoViewerCaption}>
            <div className={styles.photoViewerTitle}>
              <h2>{title}</h2>
              <p>
                {[photo.location, photo.date].filter(Boolean).join(" · ")}
              </p>
              {photo.description && <span>{photo.description}</span>}
              {actionHref && actionLabel && (
                <Link className={styles.photoViewerAction} href={actionHref}>
                  {actionLabel}
                  <ArrowUpRight size={13} strokeWidth={1.25} />
                </Link>
              )}
            </div>

            <div className={styles.photoViewerAside}>
              <p className={styles.photoViewerCount} aria-live="polite">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(photos.length).padStart(2, "0")}
              </p>

              {photo.specs && photo.specs.length > 0 && (
                <details className={styles.photoViewerDetails}>
                  <summary>
                    <Info size={14} strokeWidth={1.35} />
                    <span>{detailsLabel}</span>
                  </summary>
                  <dl>
                    {photo.specs.map(({ label, value }) => (
                      <div key={`${label}:${value}`}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </div>
          </figcaption>
        </figure>
      </div>
    </div>,
    document.body,
  );
};
