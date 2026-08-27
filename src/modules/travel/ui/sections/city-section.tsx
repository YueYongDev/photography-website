"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import BlurImage from "@/components/blur-image";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
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
    ? new Date(cityData.coverPhoto.dateTimeOriginal).getFullYear()
    : copy.common.archive;
  const coverAspectRatio =
    cityData.coverPhoto?.width && cityData.coverPhoto.height
      ? cityData.coverPhoto.width / cityData.coverPhoto.height
      : cityData.coverPhoto?.aspectRatio || 1.5;

  return (
    <section className={styles.page}>
      <div className={styles.cityHero}>
        <div>
          <p className={styles.eyebrow}>
            <Link href="/travel">{copy.navigation.travel}</Link> / <Link href={`/travel/${cityData.countryCode.toLowerCase()}`}>{displayCountry}</Link>
          </p>
          <h1 className={styles.displayTitle}>{displayCity}</h1>
        </div>
        <Link
          href={cityData.coverPhoto?.id ? `/photograph/${cityData.coverPhoto.id}` : "#"}
          className={styles.cityCover}
          style={{ aspectRatio: coverAspectRatio }}
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
        </Link>
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
            <Link
              href={`/photograph/${photo.id}`}
              className={styles.cityPhoto}
              style={{ aspectRatio }}
              key={photo.id}
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
            </Link>
          );
        })}
      </div>
    </section>
  );
};
