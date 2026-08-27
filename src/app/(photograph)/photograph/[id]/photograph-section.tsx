"use client";

import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";

import BlurImage from "@/components/blur-image";
import { formatExposureTime } from "@/lib/utils";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";

interface Props {
  id: string;
}

const LoadingState = () => (
  <div className={styles.state}>
    <div>
      <h1>Preparing the photograph.</h1>
      <p>The full-resolution frame and its field metadata are loading.</p>
    </div>
  </div>
);

const ErrorState = () => (
  <div className={styles.state}>
    <div>
      <h1>This photograph could not be opened.</h1>
      <p>It may be private, unavailable, or temporarily out of reach.</p>
    </div>
  </div>
);

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
  const router = useRouter();
  const [data] = trpc.photos.getOne.useSuspenseQuery({ id });

  if (!data) return <ErrorState />;

  const date = data.dateTimeOriginal
    ? new Date(data.dateTimeOriginal).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Archive";
  const location = [data.city, data.country].filter(Boolean).join(", ") || "Location not recorded";

  const specs = [
    ["Camera", [data.make, data.model].filter(Boolean).join(" ") || "Not recorded"],
    ["Lens", data.lensModel || "Not recorded"],
    ["Focal length", data.focalLength35mm ? `${data.focalLength35mm}mm` : "—"],
    ["Aperture", data.fNumber ? `ƒ/${data.fNumber}` : "—"],
    ["Exposure", data.exposureTime ? formatExposureTime(data.exposureTime) : "—"],
    ["Sensitivity", data.iso ? `ISO ${data.iso}` : "—"],
    ["Date", date],
    ["Place", location],
  ];

  return (
    <section className={`${styles.page} ${styles.photoPage}`}>
      <button type="button" onClick={() => router.back()} className={styles.photoBack}>
        <ArrowLeft size={15} strokeWidth={1.4} /> Back to the archive
      </button>

      <figure className={styles.photoFigure}>
        <BlurImage
          src={data.url}
          alt={data.title || "Photograph"}
          width={data.width}
          height={data.height}
          blurhash={data.blurData}
          priority
        />
      </figure>

      <div className={styles.photoInfo}>
        <div>
          <p className={styles.eyebrow}>Photograph / {data.countryCode || "Archive"}</p>
          <h1>{data.title || "Untitled"}</h1>
          <p>{data.description || "A frame from the photographic archive."}</p>
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
