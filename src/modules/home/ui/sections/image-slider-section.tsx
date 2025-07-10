"use client";

// External dependencies
import { memo, Suspense } from "react";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";

// UI Components
import Carousel from "@/components/Carousel";
import BlurImage from "@/components/blur-image";
import { Skeleton } from "@/components/ui/skeleton";
import VectorCombined from "@/components/vector-combined";

export const ImageSliderSection = () => {
  return (
    <div className="w-full h-full relative">
      <Suspense fallback={<Skeleton className="size-full" />}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <ImageSliderSuspense />
        </ErrorBoundary>
      </Suspense>

      <div className="absolute right-0 bottom-0">
        <VectorCombined title="Photography" position="bottom-right" />
      </div>
    </div>
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
              sizes="75vw"
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
