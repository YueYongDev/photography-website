"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BlurImage from "@/components/blur-image";
import MapComponent, { type MapProps } from "@/components/map";
import {
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import { toPlaceSlug } from "@/modules/travel/lib/country-groups";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";
import { PhotoListDrawer } from "./photo-list-drawer";

export const MapSection = () => <MapSectionContent />;

const MapLoading = () => {
  const { copy } = useSiteLocale();

  return (
    <div
      className={styles.mapLoading}
      role="status"
      aria-live="polite"
      aria-label={copy.map.loadingMap}
    >
      <div className={styles.mapLoadingCompass} aria-hidden="true">
        <span />
        <span />
        <i />
      </div>
      <p>{copy.map.loadingMap}</p>
    </div>
  );
};

const MapFallback = () => {
  const { copy } = useSiteLocale();
  return (
    <div className={styles.mapFallback}>
      <div className={styles.mapFallbackNote}>
        <span>{copy.map.fallbackTitle}</span>
        <p>{copy.map.fallbackDescription}</p>
      </div>
      <svg viewBox="0 0 1000 520" role="img" aria-label={copy.map.fallbackLabel}>
      <path d="M0 120 H1000 M0 260 H1000 M0 400 H1000 M180 0 V520 M500 0 V520 M820 0 V520" />
      <path className={styles.mapFallbackRoute} d="M150 360 C280 140 410 180 520 330 S730 390 850 150" />
      {[
        [150, 360, "TEKAPO", "44.0047° S"],
        [355, 206, "WĀNAKA", "44.6943° S"],
        [520, 330, "GLENORCHY", "44.8506° S"],
        [850, 150, "AORAKI", "43.5950° S"],
      ].map(([x, y, city, coordinate], index) => (
        <g key={String(city)} transform={`translate(${x} ${y})`}>
          <circle r="5" />
          <text x="14" y="-5">{String(index + 1).padStart(2, "0")} / {city}</text>
          <text x="14" y="13" className={styles.mapFallbackCoordinate}>{coordinate}</text>
        </g>
      ))}
      </svg>
    </div>
  );
};

const normalizeLocation = (value?: string | null) => {
  if (!value) return null;
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

const getCityLevelLocation = (photo: {
  countryCode?: string | null;
  city?: string | null;
  region?: string | null;
}) =>
  photo.countryCode?.toUpperCase() === "JP" || photo.countryCode?.toUpperCase() === "TW"
    ? photo.region ?? photo.city
    : photo.city ?? photo.region;

const MapSectionContent = () => {
  const { copy, locale } = useSiteLocale();
  const router = useRouter();
  const { data, ...query } = trpc.map.getMany.useInfiniteQuery(
    { limit: 200 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, retry: false }
  );
  const [activeLocation, setActiveLocation] = useState<{
    key: string;
    label: string;
  } | null>(null);

  const photos = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages]
  );

  const cityGroups = useMemo(() => {
    const groups = new Map<string, typeof photos>();

    photos.forEach((photo) => {
      if (photo.latitude === null || photo.longitude === null) return;
      const location = getCityLevelLocation(photo);
      if (!location) return;
      const key = `${photo.countryCode ?? "xx"}:${normalizeLocation(location)}`;
      groups.set(key, [...(groups.get(key) ?? []), photo]);
    });

    return Array.from(groups.entries()).map(([key, groupPhotos]) => {
      const representative = groupPhotos[0];
      const location = getCityLevelLocation(representative) ?? copy.map.unknownPlace;
      const latitude = groupPhotos.reduce((sum, photo) => sum + (photo.latitude ?? 0), 0) / groupPhotos.length;
      const longitude = groupPhotos.reduce((sum, photo) => sum + (photo.longitude ?? 0), 0) / groupPhotos.length;
      return {
        key,
        photos: groupPhotos,
        representative,
        city: location,
        countryCode: representative.countryCode,
        latitude,
        longitude,
      };
    });
  }, [copy.map.unknownPlace, photos]);

  const markers: MapProps["markers"] = cityGroups.map((group) => ({
    id: group.key,
    longitude: group.longitude,
    latitude: group.latitude,
    onClick: () => setActiveLocation({
      key: group.key,
      label: localizePlaceName(group.city, locale),
    }),
    element: (
      <button
        type="button"
        className={styles.cityMapMarker}
        aria-label={copy.map.markerLabel(
          localizePlaceName(group.city, locale),
          group.photos.length
        )}
      >
        <span>{group.photos.length}</span>
      </button>
    ),
    popupContent: (
      <button
        type="button"
        className={styles.cityMapPopup}
        onClick={() => {
          if (group.countryCode && group.city !== copy.map.unknownPlace) {
            router.push(`/travel/${group.countryCode.toLowerCase()}/${toPlaceSlug(group.city)}`);
          } else {
            router.push(`/photograph/${group.representative.id}`);
          }
        }}
      >
        <div>
          <BlurImage
            src={group.representative.url}
            alt={group.representative.title || group.city}
            fill
            quality={50}
            priority
            blurhash={group.representative.blurData}
            className={styles.imageCover}
          />
        </div>
        <span>{group.countryCode ?? "—"} · {group.photos.length} frames</span>
        <strong>{localizePlaceName(group.city, locale)}</strong>
        <small>{copy.map.openCity}</small>
      </button>
    ),
  }));

  const filteredPhotos = useMemo(() => {
    if (!activeLocation) return photos;
    return cityGroups.find((group) => group.key === activeLocation.key)?.photos ?? [];
  }, [photos, cityGroups, activeLocation]);

  if (!data && !query.isError) return <MapLoading />;
  if (query.isError) return <MapFallback />;

  return (
    <div className="relative size-full">
      <MapComponent
        id="discoverMap"
        initialViewState={{ longitude: 121.2816980216146, latitude: 31.31395498607465, zoom: 2 }}
        markers={markers}
      />
      <PhotoListDrawer
        photos={filteredPhotos}
        filterLabel={activeLocation?.label ?? null}
        hasNextPage={query.hasNextPage || false}
        isFetchingNextPage={query.isFetchingNextPage || false}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
