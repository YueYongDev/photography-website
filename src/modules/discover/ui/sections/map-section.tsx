"use client";

import { Suspense } from "react";
import Mapbox, { MapboxProps } from "@/components/map";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import BlurImage from "@/components/blur-image";
import { Blurhash } from "react-blurhash";
import { useRouter } from "next/navigation";
import { PhotoListDrawer } from "./photo-list-drawer";
import { MapProvider } from "react-map-gl";

export const MapSection = () => {
  return (
    <Suspense fallback={<MapSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <MapSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const MapSectionSkeleton = () => {
  return (
    <div className="size-full rounded-xl overflow-hidden relative">
      <Skeleton className="size-full" />
    </div>
  );
};

const MapSectionSuspense = () => {
  const router = useRouter();
  const [data] = trpc.map.getMany.useSuspenseQuery();

  const markers: MapboxProps["markers"] =
    data
      ?.filter(
        (
          photo
        ): photo is typeof photo & { longitude: number; latitude: number } =>
          photo.longitude !== null && photo.latitude !== null
      )
      .map((photo) => ({
        id: photo.id,
        longitude: photo.longitude,
        latitude: photo.latitude,
        element: (
          <div className="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 rounded-full overflow-hidden bg-background/20 ring-1 ring-white/20">
              <div
                className="w-full h-full"
                style={{ transform: "scale(1.2)" }}
              >
                <Blurhash
                  hash={photo.blurData}
                  width={12}
                  height={12}
                  punch={1}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        ),
        popupContent: (
          <div className="group/popup">
            <div className="relative">
              <BlurImage
                src={photo.url}
                alt={photo.title}
                width={500}
                height={500}
                quality={75}
                priority
                blurhash={photo.blurData}
                onClick={() => router.push(`/photograph/${photo.id}`)}
                className="cursor-pointer"
              />
            </div>
          </div>
        ),
      })) || [];

  return (
    <MapProvider>
      <div className="relative size-full">
        <Mapbox
          id="discoverMap"
          initialViewState={{
            longitude: 121.2816980216146,
            latitude: 31.31395498607465,
            zoom: 3,
          }}
          markers={markers}
        />
        <PhotoListDrawer photos={data} />
      </div>
    </MapProvider>
  );
};
