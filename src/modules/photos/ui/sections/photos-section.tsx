"use client";

import Link from "next/link";
import { memo, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Globe2Icon, HeartIcon, LockIcon } from "lucide-react";

import BlurImage from "@/components/blur-image";
import { InfiniteScroll } from "@/components/infinite-scroll";
import styles from "@/modules/dashboard/ui/studio.module.css";
import { trpc } from "@/trpc/client";

type StudioPhoto = {
  id: string;
  url: string;
  title: string;
  description: string;
  visibility: string;
  dateTimeOriginal: Date | null;
  make: string | null;
  model: string | null;
  lensModel: string | null;
  focalLength35mm: number | null;
  city: string | null;
  countryCode: string | null;
  isFavorite: boolean;
  blurData: string;
  width: number;
  height: number;
  aspectRatio: number;
  updatedAt: Date;
};

const getOrientation = (aspectRatio: number) => {
  if (aspectRatio < 0.92) return "portrait";
  if (aspectRatio > 1.12) return "landscape";
  return "square";
};

export const PhotosSection = () => (
  <ErrorBoundary
    fallback={<div className={styles.errorState}>The archive could not be opened.</div>}
  >
    <PhotosSectionContent />
  </ErrorBoundary>
);

const PhotosSectionSkeleton = () => (
  <>
    <div className={styles.archiveToolbar}>
      <span>Loading contact sheets</span>
      <span>Private + public</span>
    </div>
    <div className={styles.photoGrid} aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => {
        const orientation = ["landscape", "portrait", "square"][index % 3];
        const cardClass =
          orientation === "portrait"
            ? styles.photoCardPortrait
            : orientation === "square"
              ? styles.photoCardSquare
              : styles.photoCardLandscape;
        const ratio =
          orientation === "portrait" ? 0.75 : orientation === "square" ? 1 : 1.5;

        return (
          <div key={index} className={cardClass}>
            <div
              className={`${styles.photoImage} ${styles.skeletonBlock}`}
              style={{ aspectRatio: ratio }}
            />
            <div className={styles.photoMeta}>
              <span className={styles.photoNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.photoCopy}>
                <div className={`${styles.skeletonBlock} h-5 w-2/3`} />
                <div className={`${styles.skeletonBlock} mt-2 h-2.5 w-1/2`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </>
);

const PhotosSectionContent = () => {
  const { data: photos, ...query } =
    trpc.photos.getManyWithPrivate.useInfiniteQuery(
      { limit: 15 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  useEffect(() => {
    if (!photos?.pages) return;

    const currentPhotos = photos.pages.flatMap((page) => page.items);
    for (let index = 0; index < Math.min(5, currentPhotos.length); index += 1) {
      const image = new Image();
      image.src = currentPhotos[index].url;
    }
  }, [photos]);

  if (!photos) return <PhotosSectionSkeleton />;

  const items = photos.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return <div className={styles.emptyState}>No photographs have been added yet.</div>;
  }

  return (
    <>
      <div className={styles.archiveToolbar}>
        <span>{items.length} frames loaded</span>
        <span>Private + public archive</span>
      </div>
      <div className={styles.photoGrid}>
        {items.map((photo, index) => (
          <PhotoCard key={photo.id} photo={photo} index={index} />
        ))}
      </div>
      <InfiniteScroll
        className={styles.loadMore}
        hasNextPage={query.hasNextPage || false}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage || false}
      />
    </>
  );
};

const PhotoCard = memo(({ photo, index }: { photo: StudioPhoto; index: number }) => {
  const aspectRatio =
    photo.width > 0 && photo.height > 0
      ? photo.width / photo.height
      : photo.aspectRatio > 0
        ? photo.aspectRatio
        : 1.3;
  const orientation = getOrientation(aspectRatio);
  const orientationClass =
    orientation === "portrait"
      ? styles.photoCardPortrait
      : orientation === "square"
        ? styles.photoCardSquare
        : styles.photoCardLandscape;
  const captured = photo.dateTimeOriginal
    ? new Date(photo.dateTimeOriginal).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "Date unknown";
  const location = [photo.city, photo.countryCode].filter(Boolean).join(", ");
  const camera = [photo.make, photo.model].filter(Boolean).join(" ");
  const lens = [photo.lensModel, photo.focalLength35mm ? `${photo.focalLength35mm}mm` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/photos/${photo.id}`}
      className={`${styles.photoCard} ${orientationClass}`}
    >
      <div className={styles.photoImage} style={{ aspectRatio }}>
        <BlurImage
          src={photo.url}
          alt={photo.title || "Untitled photograph"}
          fill
          quality={35}
          className="object-contain"
          blurhash={photo.blurData}
          sizes="(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <span className={styles.photoBadge}>
          {photo.visibility === "private" ? <LockIcon size={11} /> : <Globe2Icon size={11} />}
          {photo.visibility}
        </span>
        {photo.isFavorite ? (
          <span className={styles.photoFavorite} aria-label="Selected work">
            <HeartIcon size={13} fill="currentColor" />
          </span>
        ) : null}
      </div>
      <div className={styles.photoMeta}>
        <span className={styles.photoNumber}>{String(index + 1).padStart(2, "0")}</span>
        <div className={styles.photoCopy}>
          <h2>{photo.title || "Untitled frame"}</h2>
          <p>{location || "Location unassigned"} · {captured}</p>
          <p className={styles.photoTechnical}>
            {[camera, lens].filter(Boolean).join(" — ") || "Technical notes unavailable"}
          </p>
        </div>
      </div>
    </Link>
  );
});

PhotoCard.displayName = "PhotoCard";
