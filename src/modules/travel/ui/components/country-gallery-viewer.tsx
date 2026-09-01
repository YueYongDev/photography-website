"use client";

import { useMemo, useState } from "react";

import {
  localizePlaceName,
  type SiteLocale,
} from "@/modules/site/i18n/site-locale";
import { PhotoViewer } from "@/modules/site/ui/photo-viewer";
import {
  toPlaceSlug,
  type TravelCityEntry,
} from "@/modules/travel/lib/country-groups";
import { trpc } from "@/trpc/client";

type Props = {
  cities: TravelCityEntry[];
  initialCityId: string;
  initialPhotoId: string;
  countryCode: string;
  countryName: string;
  fallbackHref: string;
  locale: SiteLocale;
  onClose: () => void;
};

export const CountryGalleryViewer = ({
  cities,
  initialCityId,
  initialPhotoId,
  countryCode,
  countryName,
  fallbackHref,
  locale,
  onClose,
}: Props) => {
  const [activePhotoId, setActivePhotoId] = useState(initialPhotoId);
  const city =
    cities.find((entry) => entry.id === initialCityId) ?? cities[0];
  const cityName = city ? localizePlaceName(city.city, locale) : countryName;
  const query = trpc.photos.getCitySetByCity.useQuery(
    { city: city?.city ?? "", countryCode },
    { enabled: Boolean(city) && !city?.photos?.length },
  );

  const photos = useMemo(() => {
    if (!city) return [];

    const remotePhotos = city.photos?.length
      ? city.photos
      : query.data
        ? [query.data.coverPhoto, ...(query.data.photos ?? [])]
        : [];
    const seen = new Set<string>();
    const items = remotePhotos.flatMap((photo) => {
      if (!photo || seen.has(photo.id)) return [];
      seen.add(photo.id);
      return [
        {
          id: photo.id,
          url: photo.url,
          title: photo.title,
          description: photo.description || query.data?.description || "",
          location: `${cityName} · ${countryName}`,
          blurData: photo.blurData,
          width: photo.width,
          height: photo.height,
          aspectRatio: photo.aspectRatio,
        },
      ];
    });

    if (items.length > 0) return items;

    return [
      {
        id: `cover-${city.id}`,
        url: city.image.url,
        title: cityName,
        description:
          query.isError
            ? locale === "zh-CN"
              ? "这座城市的其他照片暂时加载失败。"
              : "The rest of this place is temporarily unavailable."
            : "",
        location: `${cityName} · ${countryName}`,
        blurData: "",
        width: city.image.width,
        height: city.image.height,
        aspectRatio: city.image.aspectRatio,
      },
    ];
  }, [city, cityName, countryName, locale, query.data, query.isError]);

  if (!city || photos.length === 0) return null;

  const activeIndex = Math.max(
    photos.findIndex((photo) => photo.id === activePhotoId),
    0,
  );

  const actionHref = city.id.startsWith("fallback-")
    ? fallbackHref
    : `/places/${countryCode.toLowerCase()}/${toPlaceSlug(city.city)}`;

  return (
    <PhotoViewer
      activeIndex={activeIndex}
      actionHref={actionHref}
      actionLabel={
        locale === "zh-CN" ? "查看城市照片集" : "Open city collection"
      }
      context="place"
      contextLabel={`${countryName} / ${countryCode} · ${cityName}`}
      photos={photos}
      onClose={onClose}
      onSelect={(index) => setActivePhotoId(photos[index]?.id ?? photos[0].id)}
      wrap={false}
    />
  );
};
