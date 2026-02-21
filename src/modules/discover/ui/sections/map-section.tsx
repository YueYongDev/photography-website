"use client";

import { Suspense, useMemo, useState } from "react";
import MapComponent, { MapProps } from "@/components/map";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import BlurImage from "@/components/blur-image";
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

const markerColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 80% 45%)`;
};

const normalizeLocation = (value?: string | null) => {
  if (!value) return null;
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

const MapSectionSuspense = () => {
  const router = useRouter();
  const [data, query] = trpc.map.getMany.useSuspenseInfiniteQuery(
    {
      limit: 200,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const [activeLocation, setActiveLocation] = useState<{
    id?: string;
    city?: string;
    region?: string;
  } | null>(null);

  const photos = useMemo(
    () => data.pages.flatMap((page) => page.items),
    [data.pages]
  );

  const markers: MapProps["markers"] =
    photos
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
        onClick: () =>
          setActiveLocation({
            id: photo.id,
            city: photo.city ?? undefined,
            region: photo.city ? undefined : photo.region ?? undefined,
          }),
        element: (
          <div className="relative cursor-pointer group -translate-y-1/2">
            <div
              className="size-4 rounded-full border border-white shadow-md transition-all duration-200 group-hover:scale-125"
              style={{
                background: markerColor(photo.id),
                boxShadow: "0 6px 14px -6px rgba(0,0,0,0.45)",
              }}
            />
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

  const filteredPhotos = useMemo(() => {
    if (!activeLocation) return photos;
    const cityKey = normalizeLocation(activeLocation.city);
    const regionKey = normalizeLocation(activeLocation.region);
    let filtered = photos;

    if (cityKey) {
      filtered = photos.filter(
        (photo) => normalizeLocation(photo.city) === cityKey
      );
    } else if (regionKey) {
      filtered = photos.filter(
        (photo) => normalizeLocation(photo.region) === regionKey
      );
    }

    if (filtered.length === 0 && activeLocation.id) {
      const selected = photos.find((photo) => photo.id === activeLocation.id);
      return selected ? [selected] : [];
    }

    return filtered;
  }, [photos, activeLocation]);

  const filterLabel =
    activeLocation?.city ?? activeLocation?.region ?? null;

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
      <PhotoListDrawer
        photos={filteredPhotos}
        filterLabel={filterLabel}
        hasNextPage={query.hasNextPage || false}
        isFetchingNextPage={query.isFetchingNextPage || false}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
