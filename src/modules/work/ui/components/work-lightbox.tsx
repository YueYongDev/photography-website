"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { SiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

export type WorkLightboxPhoto = {
  id: string;
  url: string;
  title: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
};

type Props = {
  activeIndex: number;
  locale: SiteLocale;
  photos: WorkLightboxPhoto[];
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

const lightboxCopy = {
  en: {
    close: "Close photograph",
    dialog: "Photograph viewer",
    next: "Next photograph",
    previous: "Previous photograph",
    untitled: "Untitled",
  },
  "zh-CN": {
    close: "关闭大图",
    dialog: "照片大图浏览",
    next: "下一张照片",
    previous: "上一张照片",
    untitled: "未命名",
  },
} as const;

export const WorkLightbox = ({
  activeIndex,
  locale,
  photos,
  onClose,
  onNext,
  onPrevious,
}: Props) => {
  const copy = lightboxCopy[locale];
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pointerStartRef = useRef<number | null>(null);
  const photo = photos[activeIndex];

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

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
        onPrevious();
        return;
      }

      if (event.key === "ArrowRight" && photos.length > 1) {
        event.preventDefault();
        onNext();
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
  }, [onClose, onNext, onPrevious, photos.length]);

  if (!photo) return null;

  const aspectRatio =
    photo.width && photo.height
      ? photo.width / photo.height
      : photo.aspectRatio && photo.aspectRatio > 0
        ? photo.aspectRatio
        : 3 / 2;
  const title = photo.title || copy.untitled;

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
    if (Math.abs(distance) < 44 || photos.length < 2) return;
    if (distance > 0) onPrevious();
    else onNext();
  };

  return (
    <div
      ref={dialogRef}
      className={styles.workLightbox}
      role="dialog"
      aria-modal="true"
      aria-label={copy.dialog}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className={styles.workLightboxClose}
        onClick={onClose}
        aria-label={copy.close}
      >
        <X size={30} strokeWidth={1.15} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.workLightboxNav} ${styles.workLightboxPrevious}`}
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            aria-label={copy.previous}
          >
            <ChevronLeft size={34} strokeWidth={1.05} />
          </button>
          <button
            type="button"
            className={`${styles.workLightboxNav} ${styles.workLightboxNext}`}
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label={copy.next}
          >
            <ChevronRight size={34} strokeWidth={1.05} />
          </button>
        </>
      )}

      <div
        className={styles.workLightboxStage}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <figure className={styles.workLightboxFigure}>
          <div
            className={styles.workLightboxImage}
            style={
              {
                "--work-lightbox-ratio": aspectRatio,
              } as CSSProperties
            }
          >
            <Image
              key={photo.id}
              src={photo.url}
              alt={title}
              fill
              unoptimized
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className={styles.imageContain}
            />
          </div>
          <figcaption className={styles.workLightboxCaption}>
            <span>{title}</span>
            <span>
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
};
