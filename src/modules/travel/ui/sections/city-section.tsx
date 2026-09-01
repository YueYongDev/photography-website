"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import BlurImage from "@/components/blur-image";
import {
  DEFAULT_CAPTURE_TIMEZONE_OFFSET,
  formatCaptureDate,
  getCaptureYear,
} from "@/modules/photos/lib/camera-metadata";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import { PhotoViewer } from "@/modules/site/ui/photo-viewer";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";

interface Props {
  city: string;
  countryCode: string;
}

const LoadingState = () => {
  const { copy } = useSiteLocale();
  return (
    <div className={styles.state}>
      <div>
        <h1>{copy.city.loadingTitle}</h1>
        <p>{copy.city.loadingDescription}</p>
      </div>
    </div>
  );
};

const ErrorState = () => {
  const { copy } = useSiteLocale();
  return (
    <div className={styles.state}>
      <div>
        <h1>{copy.city.errorTitle}</h1>
        <p>{copy.city.errorDescription}</p>
      </div>
    </div>
  );
};

export const CitySection = ({ city, countryCode }: Props) => {
  return (
    <Suspense fallback={<LoadingState />}>
      <ErrorBoundary fallback={<ErrorState />}>
        <CitySectionSuspense city={city} countryCode={countryCode} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CitySectionSuspense = ({ city, countryCode }: Props) => {
  const { copy, locale } = useSiteLocale();
  const [cityData] = trpc.photos.getCitySetByCity.useSuspenseQuery({ city, countryCode });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!cityData) return <ErrorState />;

  const decodedCityName = decodeURIComponent(city);
  const displayCity = localizePlaceName(decodedCityName, locale);
  const displayCountry = localizeCountryName(
    cityData.country,
    cityData.countryCode,
    locale
  );
  const cityPhotos = cityData.photos?.filter(
    (photo) => photo.id !== cityData.coverPhoto?.id
  ) ?? [];
  const year = cityData.coverPhoto?.dateTimeOriginal
    ? getCaptureYear(
        cityData.coverPhoto.dateTimeOriginal,
        cityData.coverPhoto.captureTimezoneOffset ??
          DEFAULT_CAPTURE_TIMEZONE_OFFSET,
      ) ?? copy.common.archive
    : copy.common.archive;
  const coverAspectRatio =
    cityData.coverPhoto?.width && cityData.coverPhoto.height
      ? cityData.coverPhoto.width / cityData.coverPhoto.height
      : cityData.coverPhoto?.aspectRatio || 1.5;
  const viewerPhotos = [cityData.coverPhoto, ...cityPhotos].flatMap((photo) => {
    if (!photo) return [];
    const photoDate = photo.dateTimeOriginal
      ? formatCaptureDate(
          photo.dateTimeOriginal,
          photo.captureTimezoneOffset ?? DEFAULT_CAPTURE_TIMEZONE_OFFSET,
          locale,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        )
      : null;

    return [
      {
        id: photo.id,
        url: photo.url,
        title: photo.title,
        description: photo.description,
        location: `${displayCity} · ${displayCountry}`,
        date: photoDate,
        blurData: photo.blurData,
        width: photo.width,
        height: photo.height,
        aspectRatio: photo.aspectRatio,
      },
    ];
  });

  return (
    <section className={styles.page}>
      <div className={styles.cityHero}>
        <div>
          <p className={styles.eyebrow}>
            <Link href="/places">{copy.navigation.travel}</Link> / <Link href={`/places/${cityData.countryCode.toLowerCase()}`}>{displayCountry}</Link>
          </p>
          <h1 className={styles.displayTitle}>{displayCity}</h1>
        </div>
        <button
          type="button"
          className={styles.cityCover}
          style={{ aspectRatio: coverAspectRatio }}
          aria-label={
            cityData.coverPhoto?.title || copy.city.photoAlt(displayCity)
          }
          onClick={() => setActiveIndex(0)}
        >
          <BlurImage
            src={cityData.coverPhoto?.url || "/placeholder.svg"}
            alt={cityData.coverPhoto?.title || cityData.city}
            fill
            priority
            quality={75}
            blurhash={cityData.coverPhoto?.blurData || ""}
            sizes="90vw"
            className={styles.imageContain}
          />
        </button>
      </div>

      <div className={styles.cityMeta}>
        <div><span>{copy.common.country}</span><strong>{displayCountry}</strong></div>
        <div><span>{copy.common.place}</span><strong>{localizePlaceName(cityData.city, locale)}</strong></div>
        <div><span>{copy.common.year}</span><strong>{year}</strong></div>
        <div><span>{copy.common.frames}</span><strong>{cityData.photoCount}</strong></div>
      </div>

      <div className={styles.cityGrid}>
        {cityPhotos.map((photo, index) => {
          const aspectRatio =
            photo.width > 0 && photo.height > 0
              ? photo.width / photo.height
              : photo.aspectRatio || 1.5;

          return (
            <button
              type="button"
              className={styles.cityPhoto}
              style={{ aspectRatio }}
              key={photo.id}
              aria-label={photo.title || copy.city.photoAlt(displayCity)}
              onClick={() => setActiveIndex(index + 1)}
            >
              <BlurImage
                src={photo.url}
                alt={photo.title || copy.city.photoAlt(displayCity)}
                fill
                quality={50}
                blurhash={photo.blurData}
                sizes="(min-width: 900px) 48vw, 92vw"
                className={styles.imageContain}
              />
              <div className={styles.cityPhotoCaption}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{photo.title || copy.common.untitled}</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeIndex !== null && (
        <PhotoViewer
          activeIndex={activeIndex}
          context="place"
          contextLabel={`${displayCountry} / ${cityData.countryCode} · ${displayCity}`}
          photos={viewerPhotos}
          onClose={() => setActiveIndex(null)}
          onSelect={setActiveIndex}
        />
      )}
    </section>
  );
};
