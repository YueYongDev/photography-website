"use client";

import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";

import BlurImage from "@/components/blur-image";
import { formatExposureTime } from "@/lib/utils";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";

interface Props {
  id: string;
}

const LoadingState = () => {
  const { copy } = useSiteLocale();
  return (
    <div className={styles.state}>
      <div>
        <h1>{copy.photo.loadingTitle}</h1>
        <p>{copy.photo.loadingDescription}</p>
      </div>
    </div>
  );
};

const ErrorState = () => {
  const { copy } = useSiteLocale();
  return (
    <div className={styles.state}>
      <div>
        <h1>{copy.photo.errorTitle}</h1>
        <p>{copy.photo.errorDescription}</p>
      </div>
    </div>
  );
};

export const PhotographSection = ({ id }: Props) => {
  return (
    <Suspense fallback={<LoadingState />}>
      <ErrorBoundary fallback={<ErrorState />}>
        <PhotographSectionSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
};

const PhotographSectionSuspense = ({ id }: Props) => {
  const { copy, locale } = useSiteLocale();
  const router = useRouter();
  const [data] = trpc.photos.getOne.useSuspenseQuery({ id });

  if (!data) return <ErrorState />;

  const date = data.dateTimeOriginal
    ? new Date(data.dateTimeOriginal).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : copy.common.archive;
  const location = [
    data.city ? localizePlaceName(data.city, locale) : null,
    data.country
      ? localizeCountryName(data.country, data.countryCode, locale)
      : null,
  ].filter(Boolean).join(locale === "zh-CN" ? "，" : ", ") ||
    copy.photo.locationUnknown;

  const specs = [
    [
      copy.photo.camera,
      [data.make, data.model].filter(Boolean).join(" ") ||
        copy.common.notRecorded,
    ],
    [copy.photo.lens, data.lensModel || copy.common.notRecorded],
    [
      copy.photo.focalLength,
      data.focalLength35mm
        ? `${data.focalLength35mm}mm`
        : copy.common.notRecorded,
    ],
    [
      copy.photo.aperture,
      data.fNumber ? `ƒ/${data.fNumber}` : copy.common.notRecorded,
    ],
    [
      copy.photo.exposure,
      data.exposureTime
        ? formatExposureTime(data.exposureTime)
        : copy.common.notRecorded,
    ],
    [
      copy.photo.sensitivity,
      data.iso ? `ISO ${data.iso}` : copy.common.notRecorded,
    ],
    [copy.photo.date, date],
    [copy.common.place, location],
  ];

  return (
    <section className={`${styles.page} ${styles.photoPage}`}>
      <button
        type="button"
        onClick={() => router.back()}
        className={styles.photoBack}
      >
        <ArrowLeft size={15} strokeWidth={1.4} /> {copy.photo.back}
      </button>

      <figure className={styles.photoFigure}>
        <BlurImage
          src={data.url}
          alt={data.title || copy.photo.photograph}
          width={data.width}
          height={data.height}
          blurhash={data.blurData}
          priority
        />
      </figure>

      <div className={styles.photoInfo}>
        <div>
          <p className={styles.eyebrow}>
            {copy.photo.photograph} / {data.countryCode || copy.common.archive}
          </p>
          <h1>{data.title || copy.common.untitled}</h1>
          {locale === "en" && data.description && <p>{data.description}</p>}
        </div>

        <div className={styles.photoSpecs}>
          {specs.map(([label, value]) => (
            <div className={styles.photoSpec} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
