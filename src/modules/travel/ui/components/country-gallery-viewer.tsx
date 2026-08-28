"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";

import BlurImage from "@/components/blur-image";
import type { SiteLocale } from "@/modules/site/i18n/site-locale";
import type { TravelCityEntry } from "@/modules/travel/lib/country-groups";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";

type Props = {
  city: TravelCityEntry;
  cityName: string;
  countryCode: string;
  countryName: string;
  detailsHref: string;
  locale: SiteLocale;
  onClose: () => void;
  onNextCollection?: () => void;
};

const viewerCopy = {
  en: {
    close: "Close gallery",
    previous: "Previous photograph",
    next: "Next photograph",
    opening: "Opening the photographs…",
    details: "Open place page",
    fallback: "The rest of this place is temporarily unavailable.",
  },
  "zh-CN": {
    close: "关闭这一组照片",
    previous: "上一张照片",
    next: "下一张照片",
    opening: "正在打开照片…",
    details: "查看这座城市的全部照片",
    fallback: "这座城市的其他照片暂时加载失败。",
  },
} as const;

export const CountryGalleryViewer = ({
  city,
  cityName,
  countryCode,
  countryName,
  detailsHref,
  locale,
  onClose,
  onNextCollection,
}: Props) => {
  const copy = viewerCopy[locale];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wheelLockRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const cityQuery = trpc.photos.getCitySetByCity.useQuery(
    { city: city.city, countryCode },
    {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  );

  const photos = useMemo(() => {
    const remotePhotos = cityQuery.data
      ? [cityQuery.data.coverPhoto, ...(cityQuery.data.photos ?? [])]
      : [];
    const seen = new Set<string>();
    const uniquePhotos = remotePhotos.filter((photo) => {
      if (!photo || seen.has(photo.id)) return false;
      seen.add(photo.id);
      return true;
    });

    if (uniquePhotos.length > 0) return uniquePhotos;

    return [
      {
        id: `cover-${city.id}`,
        url: city.image.url,
        title: cityName,
        description: "",
        blurData: "",
        width: city.image.width,
        height: city.image.height,
        aspectRatio: city.image.aspectRatio,
      },
    ];
  }, [city, cityName, cityQuery.data]);

  const goTo = useCallback(
    (nextIndex: number, behavior: ScrollBehavior = "smooth") => {
      const boundedIndex = Math.max(0, Math.min(nextIndex, photos.length - 1));
      const track = trackRef.current;
      setActiveIndex(boundedIndex);
      track?.scrollTo({
        left: boundedIndex * track.clientWidth,
        behavior,
      });
    },
    [photos.length],
  );

  const closeViewer = useCallback(() => onClose(), [onClose]);

  const goNext = useCallback(() => {
    if (activeIndex < photos.length - 1) {
      goTo(activeIndex + 1);
      return;
    }

    if (onNextCollection) {
      // Keep the full-screen viewer mounted while the collection changes.
      // Reset both the DOM track and React state before the parent swaps city
      // data so the next collection starts at frame one without a stale paint.
      trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
      setActiveIndex(0);
      onNextCollection();
    }
  }, [activeIndex, goTo, onNextCollection, photos.length]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    goTo(0, "auto");
  }, [city.id, goTo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, closeViewer, goNext, goTo]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActiveIndex(
      Math.max(
        0,
        Math.min(Math.round(track.scrollLeft / track.clientWidth), photos.length - 1),
      ),
    );
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const directionValue = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
    if (Math.abs(directionValue) < 10) return;

    const now = Date.now();
    if (now - wheelLockRef.current < 420) return;
    wheelLockRef.current = now;
    if (directionValue > 0) {
      goNext();
    } else {
      goTo(activeIndex - 1);
    }
  };

  const activePhoto = photos[activeIndex] ?? photos[0];
  const activeTitle = activePhoto?.title || cityName;
  const activeDescription =
    activePhoto?.description || cityQuery.data?.description || "";

  return (
    <div
      className={styles.countryViewer}
      role="dialog"
      aria-modal="true"
      aria-label={`${countryName} / ${cityName}`}
    >
      <header className={styles.countryViewerHeader}>
        <div>
          <p>{countryName} / {countryCode}</p>
          <h2>{cityName}</h2>
        </div>
        <button
          type="button"
          onClick={closeViewer}
          aria-label={copy.close}
          autoFocus
        >
          <span>{locale === "zh-CN" ? "关闭" : "Close"}</span>
          <X size={17} strokeWidth={1.3} />
        </button>
      </header>

      <div
        ref={trackRef}
        className={styles.countryViewerTrack}
        onScroll={handleScroll}
        onWheel={handleWheel}
      >
        {photos.map((photo, index) => {
          const aspectRatio =
            photo.width > 0 && photo.height > 0
              ? photo.width / photo.height
              : photo.aspectRatio || 3 / 2;

          return (
            <div className={styles.countryViewerPanel} key={photo.id}>
              <div
                className={styles.countryViewerImage}
                style={
                  {
                    "--viewer-photo-ratio": aspectRatio,
                  } as CSSProperties
                }
              >
                <BlurImage
                  src={photo.url}
                  alt={photo.title || `${cityName} photograph ${index + 1}`}
                  fill
                  priority={index < 2}
                  quality={75}
                  blurhash={photo.blurData || ""}
                  sizes="(max-width: 600px) 94vw, 88vw"
                  className={styles.imageContain}
                />
              </div>
            </div>
          );
        })}
      </div>

      {(photos.length > 1 || onNextCollection) && (
        <>
          <button
            type="button"
            className={`${styles.countryViewerNav} ${styles.countryViewerPrevious}`}
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label={copy.previous}
          >
            <ArrowLeft size={20} strokeWidth={1.25} />
          </button>
          <button
            type="button"
            className={`${styles.countryViewerNav} ${styles.countryViewerNext}`}
            onClick={goNext}
            disabled={activeIndex === photos.length - 1 && !onNextCollection}
            aria-label={copy.next}
          >
            <ArrowRight size={20} strokeWidth={1.25} />
          </button>
        </>
      )}

      <footer className={styles.countryViewerFooter}>
        <div>
          <p>{activeTitle}</p>
          {activeDescription && <span>{activeDescription}</span>}
          {cityQuery.isLoading && <span>{copy.opening}</span>}
          {cityQuery.isError && <span>{copy.fallback}</span>}
          <Link href={detailsHref}>
            {copy.details} <ArrowUpRight size={13} strokeWidth={1.25} />
          </Link>
        </div>
        <p className={styles.countryViewerCount} aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} ·{" "}
          {String(photos.length).padStart(2, "0")}
        </p>
      </footer>
    </div>
  );
};
