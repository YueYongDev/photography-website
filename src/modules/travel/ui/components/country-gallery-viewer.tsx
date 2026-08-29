"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";

import BlurImage from "@/components/blur-image";
import {
  localizePlaceName,
  type SiteLocale,
} from "@/modules/site/i18n/site-locale";
import {
  toPlaceSlug,
  type TravelCityEntry,
} from "@/modules/travel/lib/country-groups";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";

type Props = {
  cities: TravelCityEntry[];
  initialCityId: string;
  countryCode: string;
  countryName: string;
  fallbackHref: string;
  locale: SiteLocale;
  onClose: () => void;
};

type ViewerPhoto = {
  id: string;
  url: string;
  title: string;
  description: string;
  blurData: string;
  width: number;
  height: number;
  aspectRatio: number;
};

type CollectionStatus = "idle" | "loading" | "ready" | "error";

type CollectionState = {
  photos: ViewerPhoto[];
  description: string;
  status: CollectionStatus;
};

type ViewerPosition = {
  cityIndex: number;
  photoIndex: number;
};

type SequenceItem = ViewerPosition & {
  city: TravelCityEntry;
  photo: ViewerPhoto;
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

const createFallbackCollection = (
  city: TravelCityEntry,
  locale: SiteLocale,
): CollectionState => ({
  photos: [
    {
      id: `cover-${city.id}`,
      url: city.image.url,
      title: localizePlaceName(city.city, locale),
      description: "",
      blurData: "",
      width: city.image.width,
      height: city.image.height,
      aspectRatio: city.image.aspectRatio,
    },
  ],
  description: "",
  status: "idle",
});

export const CountryGalleryViewer = ({
  cities,
  initialCityId,
  countryCode,
  countryName,
  fallbackHref,
  locale,
  onClose,
}: Props) => {
  const copy = viewerCopy[locale];
  const utils = trpc.useUtils();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wheelLockRef = useRef(0);
  const loadingCityIdsRef = useRef(new Set<string>());
  const loadedCityIdsRef = useRef(new Set<string>());
  const activeGlobalIndexRef = useRef(0);
  const programmaticScrollRef = useRef(false);
  const realigningScrollRef = useRef(false);
  const scrollReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const mountedRef = useRef(true);
  const initialCityIndex = Math.max(
    0,
    cities.findIndex((city) => city.id === initialCityId),
  );
  const [position, setPosition] = useState<ViewerPosition>({
    cityIndex: initialCityIndex,
    photoIndex: 0,
  });
  const [collections, setCollections] = useState<
    Record<string, CollectionState>
  >(() =>
    Object.fromEntries(
      cities.map((city) => [city.id, createFallbackCollection(city, locale)]),
    ),
  );

  const loadCollection = useCallback(
    async (cityIndex: number) => {
      const city = cities[cityIndex];
      if (
        !city ||
        loadedCityIdsRef.current.has(city.id) ||
        loadingCityIdsRef.current.has(city.id)
      ) {
        return;
      }

      loadingCityIdsRef.current.add(city.id);
      setCollections((current) => ({
        ...current,
        [city.id]: {
          ...(current[city.id] ?? createFallbackCollection(city, locale)),
          status: "loading",
        },
      }));

      try {
        const data = await utils.photos.getCitySetByCity.fetch({
          city: city.city,
          countryCode,
        });
        const remotePhotos = data
          ? [data.coverPhoto, ...(data.photos ?? [])]
          : [];
        const seen = new Set<string>();
        const photos = remotePhotos.reduce<ViewerPhoto[]>((result, photo) => {
          if (!photo || seen.has(photo.id)) return result;
          seen.add(photo.id);
          result.push({
            id: photo.id,
            url: photo.url,
            title: photo.title,
            description: photo.description,
            blurData: photo.blurData,
            width: photo.width,
            height: photo.height,
            aspectRatio: photo.aspectRatio,
          });
          return result;
        }, []);

        loadedCityIdsRef.current.add(city.id);
        if (!mountedRef.current) return;

        setCollections((current) => ({
          ...current,
          [city.id]: {
            photos:
              photos.length > 0
                ? photos
                : (current[city.id]?.photos ??
                  createFallbackCollection(city, locale).photos),
            description: data?.description ?? "",
            status: "ready",
          },
        }));
      } catch {
        if (!mountedRef.current) return;
        setCollections((current) => ({
          ...current,
          [city.id]: {
            ...(current[city.id] ?? createFallbackCollection(city, locale)),
            status: "error",
          },
        }));
      } finally {
        loadingCityIdsRef.current.delete(city.id);
      }
    },
    [cities, countryCode, locale, utils.photos.getCitySetByCity],
  );

  const sequence = useMemo(
    () =>
      cities.flatMap((city, cityIndex) => {
        const collection =
          collections[city.id] ?? createFallbackCollection(city, locale);

        return collection.photos.map((photo, photoIndex): SequenceItem => ({
          city,
          cityIndex,
          photo,
          photoIndex,
        }));
      }),
    [cities, collections, locale],
  );

  const activeGlobalIndex = Math.max(
    0,
    sequence.findIndex(
      (item) =>
        item.cityIndex === position.cityIndex &&
        item.photoIndex === position.photoIndex,
    ),
  );
  activeGlobalIndexRef.current = activeGlobalIndex;

  const goTo = useCallback(
    (nextIndex: number, behavior: ScrollBehavior = "smooth") => {
      if (sequence.length === 0) return;
      const boundedIndex = Math.max(0, Math.min(nextIndex, sequence.length - 1));
      const target = sequence[boundedIndex];
      const track = trackRef.current;

      if (behavior === "smooth") {
        programmaticScrollRef.current = true;
        if (scrollReleaseTimerRef.current) {
          clearTimeout(scrollReleaseTimerRef.current);
        }
        scrollReleaseTimerRef.current = setTimeout(() => {
          programmaticScrollRef.current = false;
          scrollReleaseTimerRef.current = null;
          const currentTrack = trackRef.current;
          if (!currentTrack) return;
          realigningScrollRef.current = true;
          currentTrack.scrollTo({
            left: activeGlobalIndexRef.current * currentTrack.clientWidth,
            behavior: "auto",
          });
          window.requestAnimationFrame(() => {
            realigningScrollRef.current = false;
          });
        }, 700);
      }

      setPosition({
        cityIndex: target.cityIndex,
        photoIndex: target.photoIndex,
      });
      track?.scrollTo({
        left: boundedIndex * track.clientWidth,
        behavior,
      });
    },
    [sequence],
  );

  const closeViewer = useCallback(() => onClose(), [onClose]);
  const goNext = useCallback(
    () => goTo(activeGlobalIndex + 1),
    [activeGlobalIndex, goTo],
  );
  const goPrevious = useCallback(
    () => goTo(activeGlobalIndex - 1),
    [activeGlobalIndex, goTo],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mountedRef.current = true;

    return () => {
      document.body.style.overflow = previousOverflow;
      mountedRef.current = false;
      if (scrollReleaseTimerRef.current) {
        clearTimeout(scrollReleaseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void loadCollection(position.cityIndex);
    void loadCollection(position.cityIndex + 1);
    void loadCollection(position.cityIndex - 1);
  }, [loadCollection, position.cityIndex]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || programmaticScrollRef.current) return;
    realigningScrollRef.current = true;
    track.scrollTo({
      left: activeGlobalIndexRef.current * track.clientWidth,
      behavior: "auto",
    });
    const frame = window.requestAnimationFrame(() => {
      realigningScrollRef.current = false;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [sequence.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeViewer, goNext, goPrevious]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (
      !track ||
      track.clientWidth === 0 ||
      sequence.length === 0 ||
      programmaticScrollRef.current ||
      realigningScrollRef.current
    ) {
      return;
    }
    const nextIndex = Math.max(
      0,
      Math.min(
        Math.round(track.scrollLeft / track.clientWidth),
        sequence.length - 1,
      ),
    );
    const target = sequence[nextIndex];

    setPosition((current) =>
      current.cityIndex === target.cityIndex &&
      current.photoIndex === target.photoIndex
        ? current
        : { cityIndex: target.cityIndex, photoIndex: target.photoIndex },
    );
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const directionValue =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (Math.abs(directionValue) < 10) return;

    const now = Date.now();
    if (now - wheelLockRef.current < 420) return;
    wheelLockRef.current = now;
    if (directionValue > 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  const activeItem = sequence[activeGlobalIndex] ?? sequence[0];
  if (!activeItem) return null;

  const activeCity = activeItem.city;
  const activePhoto = activeItem.photo;
  const activeCollection = collections[activeCity.id];
  const activeCityName = localizePlaceName(activeCity.city, locale);
  const activeTitle = activePhoto.title || activeCityName;
  const activeDescription =
    activePhoto.description || activeCollection?.description || "";
  const detailsHref = activeCity.id.startsWith("fallback-")
    ? fallbackHref
    : `/places/${countryCode.toLowerCase()}/${toPlaceSlug(activeCity.city)}`;

  return (
    <div
      className={styles.countryViewer}
      role="dialog"
      aria-modal="true"
      aria-label={`${countryName} / ${activeCityName}`}
    >
      <header className={styles.countryViewerHeader}>
        <div>
          <p>
            {countryName} / {countryCode}
          </p>
          <h2>{activeCityName}</h2>
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
        {sequence.map((item, index) => {
          const { city, cityIndex, photo, photoIndex } = item;
          const cityName = localizePlaceName(city.city, locale);
          const aspectRatio =
            photo.width > 0 && photo.height > 0
              ? photo.width / photo.height
              : photo.aspectRatio || 3 / 2;
          const eager = Math.abs(cityIndex - position.cityIndex) <= 1;

          return (
            <div
              className={styles.countryViewerPanel}
              key={`${city.id}:${photo.url}:${photoIndex}`}
            >
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
                  alt={photo.title || `${cityName} photograph ${photoIndex + 1}`}
                  fill
                  loading={eager ? "eager" : "lazy"}
                  fetchPriority={
                    Math.abs(index - activeGlobalIndex) <= 1 ? "high" : "auto"
                  }
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

      {sequence.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.countryViewerNav} ${styles.countryViewerPrevious}`}
            onClick={goPrevious}
            disabled={activeGlobalIndex === 0}
            aria-label={copy.previous}
          >
            <ArrowLeft size={20} strokeWidth={1.25} />
          </button>
          <button
            type="button"
            className={`${styles.countryViewerNav} ${styles.countryViewerNext}`}
            onClick={goNext}
            disabled={activeGlobalIndex === sequence.length - 1}
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
          {activeCollection?.status === "loading" && (
            <span>{copy.opening}</span>
          )}
          {activeCollection?.status === "error" && <span>{copy.fallback}</span>}
          <Link href={detailsHref}>
            {copy.details} <ArrowUpRight size={13} strokeWidth={1.25} />
          </Link>
        </div>
        <p className={styles.countryViewerCount} aria-live="polite">
          {String(activeItem.photoIndex + 1).padStart(2, "0")} ·{" "}
          {String(activeCollection?.photos.length ?? 1).padStart(2, "0")}
        </p>
      </footer>
    </div>
  );
};
