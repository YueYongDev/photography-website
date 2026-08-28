"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Map } from "lucide-react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import {
  toPlaceSlug,
  type TravelCityEntry,
  type TravelCountryGroup,
} from "@/modules/travel/lib/country-groups";
import { CountryGalleryViewer } from "@/modules/travel/ui/components/country-gallery-viewer";
import styles from "@/modules/site/ui/public-site.module.css";
import { trpc } from "@/trpc/client";

export const CountryView = ({ country }: { country: TravelCountryGroup }) => {
  const { copy, locale } = useSiteLocale();
  const utils = trpc.useUtils();
  const [selectedCity, setSelectedCity] = useState<TravelCityEntry | null>(null);
  const countryName = localizeCountryName(country.name, country.code, locale);
  const fallbackHref =
    country.code === "NZ"
      ? "/journeys/newzealand-2026"
      : country.code === "UZ"
        ? "/journeys/uzbekistan-2026"
        : "/map";
  const selectedCityIndex = selectedCity
    ? country.cities.findIndex((city) => city.id === selectedCity.id)
    : -1;
  const nextCity =
    selectedCityIndex >= 0 ? country.cities[selectedCityIndex + 1] : undefined;

  useEffect(() => {
    if (!nextCity) return;

    void utils.photos.getCitySetByCity.prefetch({
      city: nextCity.city,
      countryCode: country.code,
    });

    const nextCover = new window.Image();
    nextCover.src = nextCity.image.url;
  }, [country.code, nextCity, utils.photos.getCitySetByCity]);

  return (
    <section className={styles.page}>
      <Link href="/places" className={styles.journeyBack}>
        <ArrowLeft size={15} strokeWidth={1.4} /> {copy.country.all}
      </Link>

      <div className={styles.countryHero}>
        <div>
          <p className={styles.eyebrow}>
            {copy.navigation.travel} / {country.code}
          </p>
          <h1>{countryName}</h1>
        </div>
        <div className={styles.countryHeroMeta}>
          <dl>
            <div>
              <dt>{copy.common.places}</dt>
              <dd>{String(country.cities.length).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>{copy.common.frames}</dt>
              <dd>{String(country.frames).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>{copy.common.years}</dt>
              <dd>{country.years.join(" / ")}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={styles.countryGalleryHead}>
        <p>{copy.common.places}</p>
      </div>

      <div className={styles.countryGalleryGrid}>
        {country.cities.map((city, index) => {
          const cityName = localizePlaceName(city.city, locale);
          const cardContents = (
            <>
              <div className={styles.countryGalleryImage}>
                <Image
                  src={city.image.url}
                  alt={cityName}
                  fill
                  loader={getArchiveImageLoader(city.image.url)}
                  priority={index < 3}
                  sizes="(max-width: 600px) 92vw, (max-width: 900px) 46vw, 31vw"
                  className={styles.imageCover}
                />
                <div className={styles.countryGalleryShade} />
              </div>
              <span className={styles.countryGalleryNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.countryGalleryCopy}>
                <p>{copy.country.cityFrames(city.year, city.photoCount)}</p>
                <h2>{cityName}</h2>
              </div>
              <ArrowUpRight
                className={styles.countryGalleryArrow}
                size={17}
                strokeWidth={1.3}
              />
            </>
          );

          return (
            <button
              type="button"
              className={styles.countryGalleryCard}
              onClick={() => setSelectedCity(city)}
              aria-label={copy.country.openGallery(cityName, city.photoCount)}
              key={city.id}
            >
              {cardContents}
            </button>
          );
        })}
      </div>

      <Link href="/map" className={styles.countryMapLink}>
        <Map size={17} strokeWidth={1.4} />
        <span>{copy.country.mapLink}</span>
        <ArrowUpRight size={16} strokeWidth={1.4} />
      </Link>

      {selectedCity && (
        <CountryGalleryViewer
          city={selectedCity}
          cityName={localizePlaceName(selectedCity.city, locale)}
          countryCode={country.code}
          countryName={countryName}
          detailsHref={
            selectedCity.id.startsWith("fallback-")
              ? fallbackHref
              : `/places/${country.code.toLowerCase()}/${toPlaceSlug(selectedCity.city)}`
          }
          locale={locale}
          onClose={() => setSelectedCity(null)}
          onNextCollection={
            nextCity ? () => setSelectedCity(nextCity) : undefined
          }
        />
      )}
    </section>
  );
};
