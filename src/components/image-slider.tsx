"use client";

// External dependencies
import { memo, Suspense } from "react";

// UI Components
import Carousel from "./Carousel";
import BlurImage from "./blur-image";
import { Skeleton } from "./ui/skeleton";

// HOOKS
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";

/**
 * ImageSlider component displays a carousel of images.
 *
 * @returns {JSX.Element} - The ImageSlider component.
 */
export const ImageSlider = () => {
  return (
    <Suspense fallback={<Skeleton className="size-full" />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ImageSliderSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const ImageSliderSuspense = memo(function ImageSlider() {
  const [photos] = trpc.photos.getLikedPhotos.useSuspenseQuery({
    limit: 10,
  });

  return (
    <Carousel
      className="absolute top-0 left-0 w-full h-full rounded-xl"
      containerClassName="h-full"
    >
      {photos.map((photo, index) => {
        const shouldPreload = index < 1;

        return (
          <div key={photo.id} className="flex-[0_0_100%] h-full relative">
            <BlurImage
              src={photo.url}
              alt={photo.title}
              fill
              priority={shouldPreload}
              loading={shouldPreload ? "eager" : "lazy"}
              blurhash={photo.blurData}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
    </Carousel>
  );
});
