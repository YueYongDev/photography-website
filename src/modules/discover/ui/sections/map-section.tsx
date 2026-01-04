"use client";

import { Suspense } from "react";
import MapComponent, { MapProps } from "@/components/map";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import BlurImage from "@/components/blur-image";
import { Blurhash } from "react-blurhash";
import { useRouter } from "next/navigation";
import { PhotoListDrawer } from "./photo-list-drawer";
// removed react-map-gl import

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

  const markers: MapProps["markers"] =
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
          <div className="relative cursor-pointer group -translate-y-1/2">
            {/* Ping effect for active/discovery feel */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>

            <div className="size-10 rounded-full border-2 border-white shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-125 group-hover:ring-4 group-hover:ring-blue-400/30">
              <div className="w-full h-full transform scale-125">
                <Blurhash
                  hash={photo.blurData}
                  width={40}
                  height={40}
                  punch={1}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
            </div>
          </div>
        ),
        popupContent: (
          <div
            className="group/popup min-w-[200px] max-w-[280px] bg-background/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-300 hover:scale-[1.02]"
            onClick={() => router.push(`/photograph/${photo.id}`)}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <BlurImage
                src={photo.url}
                alt={photo.title}
                fill
                quality={50}
                priority
                blurhash={photo.blurData}
                className="object-cover transition-transform duration-500 group-hover/popup:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6">
                <h3 className="text-white text-sm font-semibold truncate leading-tight">
                  {photo.title || "Untitled"}
                </h3>
                <p className="text-white/80 text-[10px] truncate mt-0.5">
                  {photo.city || photo.region || "Unknown Location"}
                </p>
              </div>
            </div>
          </div>
        ),
      })) || [];

  return (
    <div className="relative size-full">
      <MapComponent
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
  );
};
