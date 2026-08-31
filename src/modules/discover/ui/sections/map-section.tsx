"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Globe2,
  Layers3,
  LocateFixed,
  Map as MapIcon,
  Search,
  X,
} from "lucide-react";

import BlurImage from "@/components/blur-image";
import BlurText from "@/components/react-bits/blur-text";
import {
  Map,
  MapMarker,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
import type { Photo } from "@/db/schema/photos";
import {
  formatAperture,
  formatFocalLength,
  formatIso,
  formatShutterSpeed,
} from "@/modules/photos/lib/camera-metadata";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import {
  PhotoViewer,
  type PhotoViewerItem,
  type PhotoViewerSpec,
} from "@/modules/site/ui/photo-viewer";
import { VantaNetBackground } from "@/modules/site/ui/vanta-net-background";
import { toPlaceSlug } from "@/modules/travel/lib/country-groups";
import { trpc } from "@/trpc/client";
import styles from "./map-experience.module.css";

type MapMode = "globe" | "atlas";

const archiveMapStyles = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
} as const;

type CityGroup = {
  key: string;
  city: string;
  country: string;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  photos: Photo[];
  representative: Photo;
};

const normalizeLocation = (value?: string | null) => {
  if (!value) return null;
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
};

const getCityLevelLocation = (photo: Pick<Photo, "countryCode" | "city" | "region">) =>
  photo.countryCode?.toUpperCase() === "JP" ||
  photo.countryCode?.toUpperCase() === "TW"
    ? photo.region ?? photo.city
    : photo.city ?? photo.region;

const getCityHref = (group: CityGroup) =>
  group.countryCode
    ? `/places/${group.countryCode.toLowerCase()}/${toPlaceSlug(group.city)}`
    : null;

const MapSceneController = ({
  mode,
  panelOpen,
  selectedGroup,
  visibleGroups,
  resetVersion,
}: {
  mode: MapMode;
  panelOpen: boolean;
  selectedGroup: CityGroup | null;
  visibleGroups: CityGroup[];
  resetVersion: number;
}) => {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    map.setProjection({ type: mode === "globe" ? "globe" : "mercator" });
    map.setSky({
      "sky-color": "#ffffff",
      "horizon-color": "#ffffff",
      "fog-color": "#ffffff",
      "sky-horizon-blend": 0.82,
      "horizon-fog-blend": 0.72,
      "atmosphere-blend": mode === "globe" ? 0.72 : 0,
    });
  }, [isLoaded, map, mode]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const compact = window.matchMedia("(max-width: 760px)").matches;
    const panelOffset: [number, number] = !panelOpen
      ? [0, 0]
      : compact
        ? [0, -110]
        : [-170, 0];

    if (selectedGroup) {
      map.flyTo({
        center: [selectedGroup.longitude, selectedGroup.latitude],
        zoom: mode === "globe" ? 5.4 : 7.2,
        offset: panelOffset,
        duration: 1450,
        essential: true,
      });
      return;
    }

    if (visibleGroups.length > 0 && visibleGroups.length < 8) {
      const longitudes = visibleGroups.map((group) => group.longitude);
      const latitudes = visibleGroups.map((group) => group.latitude);
      const west = Math.min(...longitudes);
      const east = Math.max(...longitudes);
      const south = Math.min(...latitudes);
      const north = Math.max(...latitudes);

      if (visibleGroups.length === 1) {
        map.flyTo({
          center: [visibleGroups[0].longitude, visibleGroups[0].latitude],
          zoom: mode === "globe" ? 4 : 5.5,
          offset: panelOffset,
          duration: 1200,
          essential: true,
        });
      } else {
        map.fitBounds(
          [
            [west, south],
            [east, north],
          ],
          {
            padding: compact
              ? { top: 120, right: 40, bottom: panelOpen ? 300 : 90, left: 40 }
              : { top: 110, right: panelOpen ? 420 : 90, bottom: 110, left: 90 },
            maxZoom: mode === "globe" ? 4.4 : 5.8,
            duration: 1200,
          },
        );
      }
      return;
    }

    map.flyTo({
      center: [48, 24],
      zoom: mode === "globe" ? 1.25 : 1.7,
      bearing: 0,
      pitch: 0,
      duration: 1200,
      essential: true,
    });
  }, [isLoaded, map, mode, panelOpen, resetVersion, selectedGroup, visibleGroups]);

  return null;
};

const MapLoading = () => {
  const { copy } = useSiteLocale();

  return (
    <section
      className={`${styles.state} ${styles.loadingState}`}
      role="status"
      aria-live="polite"
    >
      <VantaNetBackground className={styles.loadingVanta} />
      <div className={styles.loadingCard}>
        <span className={styles.loadingKicker}>MAP / LIVE ARCHIVE</span>
        <BlurText
          text={copy.map.loadingMap}
          animateBy="letters"
          direction="bottom"
          delay={42}
          stepDuration={0.38}
          className={styles.loadingLabel}
        />
        <div className={styles.loadingCoordinates} aria-hidden="true">
          <span>30.2741° N</span>
          <i />
          <span>120.1551° E</span>
        </div>
      </div>
    </section>
  );
};

const MapFallback = () => {
  const { copy } = useSiteLocale();

  return (
    <section className={styles.state}>
      <div className={styles.stateGrid} aria-hidden="true" />
      <div className={styles.fallbackCard}>
        <span>MAP / OFFLINE</span>
        <h1>{copy.map.fallbackTitle}</h1>
        <p>{copy.map.fallbackDescription}</p>
        <Link href="/places">
          <ArrowLeft size={15} strokeWidth={1.4} /> {copy.map.browsePlaces}
        </Link>
      </div>
    </section>
  );
};

export const MapSection = () => {
  const { copy, locale } = useSiteLocale();
  const { data, ...query } = trpc.map.getMany.useInfiniteQuery(
    { limit: 500 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, retry: false },
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeCountryCode, setActiveCountryCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<MapMode>("globe");
  const [panelOpen, setPanelOpen] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const photos = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const cityGroups = useMemo<CityGroup[]>(() => {
    const groups = new globalThis.Map<string, Photo[]>();

    photos.forEach((photo) => {
      if (photo.latitude === null || photo.longitude === null) return;
      const location = getCityLevelLocation(photo);
      if (!location) return;
      const key = `${photo.countryCode ?? "xx"}:${normalizeLocation(location)}`;
      groups.set(key, [...(groups.get(key) ?? []), photo]);
    });

    return Array.from(groups.entries())
      .map(([key, groupPhotos]) => {
        const representative = groupPhotos[0];
        const city = getCityLevelLocation(representative) ?? copy.map.unknownPlace;

        return {
          key,
          city,
          country:
            representative.country ??
            representative.countryCode ??
            copy.common.notRecorded,
          countryCode: representative.countryCode,
          latitude:
            groupPhotos.reduce((sum, photo) => sum + (photo.latitude ?? 0), 0) /
            groupPhotos.length,
          longitude:
            groupPhotos.reduce((sum, photo) => sum + (photo.longitude ?? 0), 0) /
            groupPhotos.length,
          photos: groupPhotos,
          representative,
        };
      })
      .sort((left, right) =>
        `${left.countryCode ?? "ZZ"}-${left.city}`.localeCompare(
          `${right.countryCode ?? "ZZ"}-${right.city}`,
        ),
      );
  }, [copy.common.notRecorded, copy.map.unknownPlace, photos]);

  const countries = useMemo(
    () =>
      Array.from(
        new globalThis.Map(
          cityGroups
            .filter((group) => group.countryCode)
            .map((group) => [
              group.countryCode as string,
              { code: group.countryCode as string, name: group.country },
            ]),
        ).values(),
      ),
    [cityGroups],
  );

  const visibleGroups = useMemo(
    () =>
      activeCountryCode
        ? cityGroups.filter((group) => group.countryCode === activeCountryCode)
        : cityGroups,
    [activeCountryCode, cityGroups],
  );

  const normalizedQuery = normalizeLocation(searchQuery) ?? "";
  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return visibleGroups;

    return visibleGroups.filter((group) => {
      const searchable = [
        localizePlaceName(group.city, locale),
        localizeCountryName(group.country, group.countryCode, locale),
        group.countryCode,
      ];

      return searchable.some((value) =>
        normalizeLocation(value)?.includes(normalizedQuery),
      );
    });
  }, [locale, normalizedQuery, visibleGroups]);

  const selectedGroup =
    cityGroups.find((group) => group.key === selectedKey) ?? null;
  const selectedCityHref = selectedGroup ? getCityHref(selectedGroup) : null;
  const mappedPhotoCount = cityGroups.reduce(
    (total, group) => total + group.photos.length,
    0,
  );
  const mapViewerPhotos: PhotoViewerItem[] = selectedGroup
    ? selectedGroup.photos.slice(0, 6).map((photo) => {
        const title = photo.title || copy.common.untitled;
        const date = photo.dateTimeOriginal
          ? new Date(photo.dateTimeOriginal).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null;
        const location =
          photo.placeFormatted ||
          [
            photo.city ? localizePlaceName(photo.city, locale) : null,
            photo.country
              ? localizeCountryName(
                  photo.country,
                  photo.countryCode,
                  locale,
                )
              : null,
          ]
            .filter(Boolean)
            .join(locale === "zh-CN" ? "，" : ", ");
        const camera = [photo.make, photo.model].filter(Boolean).join(" ");
        const focalLength = photo.focalLength35mm ?? photo.focalLength;
        const specs = [
          camera ? { label: copy.photo.camera, value: camera } : null,
          photo.lensModel
            ? { label: copy.photo.lens, value: photo.lensModel }
            : null,
          focalLength
            ? {
                label: copy.photo.focalLength,
                value: formatFocalLength(focalLength),
              }
            : null,
          photo.fNumber
            ? {
                label: copy.photo.aperture,
                value: formatAperture(photo.fNumber),
              }
            : null,
          photo.exposureTime
            ? {
                label: copy.photo.exposure,
                value: formatShutterSpeed(photo.exposureTime),
              }
            : null,
          photo.iso
            ? {
                label: copy.photo.sensitivity,
                value: formatIso(photo.iso),
              }
            : null,
          location
            ? { label: copy.common.place, value: location }
            : null,
        ].filter((spec): spec is PhotoViewerSpec => Boolean(spec));

        return {
          id: photo.id,
          url: photo.url,
          title,
          description: photo.description,
          location,
          date,
          blurData: photo.blurData,
          width: photo.width,
          height: photo.height,
          aspectRatio: photo.aspectRatio,
          specs,
        };
      })
    : [];

  const selectCountry = (countryCode: string | null) => {
    setActiveCountryCode(countryCode);
    setSelectedKey(null);
    setSearchQuery("");
    setResetVersion((version) => version + 1);
  };

  const resetMap = () => {
    setActiveCountryCode(null);
    setSelectedKey(null);
    setSearchQuery("");
    setResetVersion((version) => version + 1);
  };

  if (!data && !query.isError) return <MapLoading />;
  if (query.isError) return <MapFallback />;

  return (
    <section className={styles.experience} data-panel-open={panelOpen}>
      <div className={styles.mapCanvas}>
        <Map
          id="archiveMap"
          center={[48, 24]}
          zoom={1.25}
          minZoom={0.7}
          maxZoom={16}
          dragRotate={false}
          pitchWithRotate={false}
          styles={archiveMapStyles}
        >
          <MapSceneController
            mode={mode}
            panelOpen={panelOpen}
            selectedGroup={selectedGroup}
            visibleGroups={visibleGroups}
            resetVersion={resetVersion}
          />

          {visibleGroups.map((group) => {
            const active = group.key === selectedKey;
            const cityName = localizePlaceName(group.city, locale);

            return (
              <MapMarker
                key={group.key}
                longitude={group.longitude}
                latitude={group.latitude}
                ariaLabel={copy.map.markerLabel(cityName, group.photos.length)}
                onClick={() => {
                  setSelectedKey(group.key);
                  setPanelOpen(true);
                }}
              >
                <MarkerContent>
                  <span
                    className={`${styles.marker} ${active ? styles.markerActive : ""}`}
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                </MarkerContent>
              </MapMarker>
            );
          })}
        </Map>
      </div>

      <div className={styles.mapWash} aria-hidden="true" />

      <header className={styles.mapIdentity}>
        <span>{copy.discover.eyebrow}</span>
        <h1>{copy.map.mappedArchive}</h1>
      </header>

      <button
        type="button"
        className={styles.exploreButton}
        aria-expanded={panelOpen}
        aria-controls="map-archive-panel"
        tabIndex={panelOpen ? -1 : 0}
        onClick={() => setPanelOpen(true)}
      >
        <Search size={15} strokeWidth={1.5} />
        <span>{copy.map.explorePlaces}</span>
        <strong>{String(visibleGroups.length).padStart(2, "0")}</strong>
      </button>

      <div className={styles.mapDock}>
        <div className={styles.dockStats} aria-label={copy.map.archiveSummary}>
          <span>
            <strong>{String(countries.length).padStart(2, "0")}</strong>
            <small>{copy.travel.countries}</small>
          </span>
          <span>
            <strong>{String(cityGroups.length).padStart(2, "0")}</strong>
            <small>{copy.travel.cities}</small>
          </span>
          <span>
            <strong>{String(mappedPhotoCount).padStart(3, "0")}</strong>
            <small>{copy.common.frames}</small>
          </span>
        </div>
        <i aria-hidden="true" />
        <div className={styles.dockControls}>
          <button type="button" onClick={resetMap}>
            <LocateFixed size={15} strokeWidth={1.5} />
            <span>{copy.map.overview}</span>
          </button>
          <button
            type="button"
            aria-pressed={mode === "globe"}
            onClick={() => setMode("globe")}
          >
            <Globe2 size={15} strokeWidth={1.5} />
            <span>{copy.map.globe}</span>
          </button>
          <button
            type="button"
            aria-pressed={mode === "atlas"}
            onClick={() => setMode("atlas")}
          >
            <MapIcon size={15} strokeWidth={1.5} />
            <span>{copy.map.atlas}</span>
          </button>
        </div>
      </div>

      <aside
        id="map-archive-panel"
        className={styles.archivePanel}
        data-lenis-prevent
        aria-hidden={!panelOpen}
        inert={!panelOpen}
      >
        <div className={styles.panelHeader}>
          <div>
            <span>
              MAP INDEX / {String(visibleGroups.length).padStart(2, "0")}
            </span>
            <h2>
              {selectedGroup
                ? localizePlaceName(selectedGroup.city, locale)
                : copy.map.mappedArchive}
            </h2>
          </div>
          <button
            type="button"
            aria-label={copy.map.hideArchive}
            onClick={() => setPanelOpen(false)}
          >
            <X size={17} strokeWidth={1.4} />
          </button>
        </div>

        {selectedGroup ? (
          <div className={styles.cityDetail}>
            <button
              type="button"
              className={styles.backToIndex}
              onClick={() => setSelectedKey(null)}
            >
              <ArrowLeft size={14} strokeWidth={1.5} /> {copy.map.allCities}
            </button>

            <div className={styles.cityDetailMeta}>
              <span>
                {localizeCountryName(
                  selectedGroup.country,
                  selectedGroup.countryCode,
                  locale,
                )}
              </span>
              <span>
                {selectedGroup.photos.length} {copy.common.frames}
              </span>
            </div>

            <div className={styles.photoGrid}>
              {selectedGroup.photos.slice(0, 6).map((photo, index) => (
                <button
                  type="button"
                  className={styles.photoTile}
                  key={photo.id}
                  aria-label={photo.title || copy.city.photoAlt(selectedGroup.city)}
                  onClick={() => setActivePhotoIndex(index)}
                >
                  <BlurImage
                    src={photo.url}
                    alt={photo.title || copy.city.photoAlt(selectedGroup.city)}
                    fill
                    quality={50}
                    blurhash={photo.blurData}
                    sizes="(max-width: 760px) 40vw, 12vw"
                    className={styles.photoImage}
                  />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </button>
              ))}
            </div>

            {selectedCityHref && (
              <Link
                href={selectedCityHref}
                className={styles.openCityLink}
              >
                <span>
                  <small>{copy.map.openCollection}</small>
                  {localizePlaceName(selectedGroup.city, locale)}
                </span>
                <ArrowUpRight size={18} strokeWidth={1.4} />
              </Link>
            )}

            {query.hasNextPage && (
              <button
                type="button"
                className={styles.loadMore}
                disabled={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
              >
                <Layers3 size={15} strokeWidth={1.5} />
                {query.isFetchingNextPage ? copy.map.loading : copy.map.loadMore}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.panelControls}>
              <div className={styles.searchField}>
                <Search size={15} strokeWidth={1.4} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  aria-label={copy.map.searchPlaces}
                  placeholder={copy.map.searchPlaces}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label={copy.map.clearSearch}
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={14} strokeWidth={1.4} />
                  </button>
                )}
              </div>

              <div className={styles.countryChips} aria-label={copy.map.filterCountry}>
                <button
                  type="button"
                  className={!activeCountryCode ? styles.countryActive : ""}
                  onClick={() => selectCountry(null)}
                >
                  {copy.map.allPlaces}
                </button>
                {countries.map((country) => (
                  <button
                    type="button"
                    key={country.code}
                    className={
                      activeCountryCode === country.code ? styles.countryActive : ""
                    }
                    title={localizeCountryName(country.name, country.code, locale)}
                    onClick={() => selectCountry(country.code)}
                  >
                    {country.code}
                  </button>
                ))}
              </div>

              <div className={styles.resultsBar}>
                <span>
                  {activeCountryCode
                    ? localizeCountryName(
                        countries.find((country) => country.code === activeCountryCode)
                          ?.name ?? activeCountryCode,
                        activeCountryCode,
                        locale,
                      )
                    : copy.map.allCities}
                </span>
                <strong>{String(filteredGroups.length).padStart(2, "0")}</strong>
              </div>
            </div>

            <div className={styles.cityIndex}>
              {filteredGroups.length === 0 ? (
                <div className={styles.emptyResults}>
                  <Search size={19} strokeWidth={1.2} />
                  <p>{copy.map.noResults}</p>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const cityName = localizePlaceName(group.city, locale);

                  return (
                    <button
                      type="button"
                      className={styles.cityIndexItem}
                      onClick={() => setSelectedKey(group.key)}
                      key={group.key}
                    >
                      <span className={styles.cityIndexThumb}>
                        <BlurImage
                          src={group.representative.url}
                          alt=""
                          fill
                          quality={35}
                          blurhash={group.representative.blurData}
                          sizes="64px"
                          className={styles.photoImage}
                        />
                      </span>
                      <span className={styles.cityIndexCopy}>
                        <small>
                          {localizeCountryName(
                            group.country,
                            group.countryCode,
                            locale,
                          )}{` · `}
                          {group.photos.length} {copy.common.frames}
                        </small>
                        <strong>{cityName}</strong>
                      </span>
                      <ArrowUpRight size={15} strokeWidth={1.35} />
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </aside>

      {selectedGroup && activePhotoIndex !== null && (
        <PhotoViewer
          activeIndex={activePhotoIndex}
          context="map"
          contextLabel={`${localizePlaceName(selectedGroup.city, locale)} · ${localizeCountryName(
            selectedGroup.country,
            selectedGroup.countryCode,
            locale,
          )}`}
          photos={mapViewerPhotos}
          onClose={() => setActivePhotoIndex(null)}
          onSelect={setActivePhotoIndex}
        />
      )}
    </section>
  );
};
