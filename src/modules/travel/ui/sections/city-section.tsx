"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import BlurImage from "@/components/blur-image";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";

interface Props {
  city: string;
}

const LoadingState = () => (
  <div className={styles.state}>
    <div>
      <h1>Opening the archive.</h1>
      <p>The photographs and field metadata are being prepared.</p>
    </div>
  </div>
);

const ErrorState = () => (
  <div className={styles.state}>
    <div>
      <h1>This place is temporarily out of reach.</h1>
      <p>The archive could not be loaded. Return to Atlas and try again shortly.</p>
    </div>
  </div>
);

export const CitySection = ({ city }: Props) => {
  return (
    <Suspense fallback={<LoadingState />}>
      <ErrorBoundary fallback={<ErrorState />}>
        <CitySectionSuspense city={city} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CitySectionSuspense = ({ city }: Props) => {
  const [cityData] = trpc.photos.getCitySetByCity.useSuspenseQuery({ city });

  if (!cityData) return <ErrorState />;

  const decodedCityName = decodeURIComponent(city);
  const cityPhotos = cityData.photos?.filter(
    (photo) => photo.id !== cityData.coverPhoto?.id
  ) ?? [];
  const year = cityData.coverPhoto?.dateTimeOriginal
    ? new Date(cityData.coverPhoto.dateTimeOriginal).getFullYear()
    : "Archive";

  return (
    <section className={styles.page}>
      <div className={styles.cityHero}>
        <div>
          <p className={styles.eyebrow}>Atlas / {cityData.countryCode}</p>
          <h1 className={styles.displayTitle}>{decodedCityName}</h1>
        </div>
        <p className={styles.lede} style={{ margin: 0 }}>
          {cityData.description ||
            `A photographic place study from ${decodedCityName}, kept as part of the geographic archive.`}
        </p>

        <Link
          href={cityData.coverPhoto?.id ? `/photograph/${cityData.coverPhoto.id}` : "#"}
          className={styles.cityCover}
        >
          <BlurImage
            src={cityData.coverPhoto?.url || "/placeholder.svg"}
            alt={cityData.coverPhoto?.title || cityData.city}
            fill
            priority
            quality={75}
            blurhash={cityData.coverPhoto?.blurData || ""}
            sizes="90vw"
            className={styles.imageCover}
          />
        </Link>
      </div>

      <div className={styles.cityMeta}>
        <div><span>Country</span><strong>{cityData.country}</strong></div>
        <div><span>Place</span><strong>{cityData.city}</strong></div>
        <div><span>Year</span><strong>{year}</strong></div>
        <div><span>Frames</span><strong>{cityData.photoCount}</strong></div>
      </div>

      <div className={styles.cityGrid}>
        {cityPhotos.map((photo, index) => (
          <Link href={`/photograph/${photo.id}`} className={styles.cityPhoto} key={photo.id}>
            <BlurImage
              src={photo.url}
              alt={photo.title || `${decodedCityName} photograph`}
              fill
              quality={50}
              blurhash={photo.blurData}
              sizes="(min-width: 900px) 48vw, 92vw"
              className={styles.imageCover}
            />
            <div className={styles.cityPhotoCaption}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{photo.title || "Untitled"}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
