"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Map } from "lucide-react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import {
  type TravelCityEntry,
  type TravelCountryGroup,
} from "@/modules/travel/lib/country-groups";
import { CountryGalleryViewer } from "@/modules/travel/ui/components/country-gallery-viewer";
import styles from "@/modules/site/ui/public-site.module.css";

export const CountryView = ({ country }: { country: TravelCountryGroup }) => {
  const { copy, locale } = useSiteLocale();
  const [selection, setSelection] = useState<{
    city: TravelCityEntry;
    photoId: string;
  } | null>(null);
  const countryName = localizeCountryName(country.name, country.code, locale);
  const fallbackHref =
    country.code === "NZ"
      ? "/journeys/newzealand-2026"
      : country.code === "UZ"
        ? "/journeys/uzbekistan-2026"
        : "/map";
  return (
    <section className={styles.page}>
      <Link href="/places" className={styles.journeyBack}>
        <ArrowLeft size={15} strokeWidth={1.4} /> {copy.country.all}
      </Link>

      <div className={styles.countryHero}>
        <div data-motion-reveal="left">
          <p className={styles.eyebrow}>
            {copy.navigation.travel} / {country.code}
          </p>
          <h1>{countryName}</h1>
        </div>
        <div className={styles.countryHeroMeta} data-motion-reveal="right">
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
        <p>{copy.common.frames}</p>
      </div>

      <div className={styles.countryCityGroups}>
        {country.cities.map((city, cityIndex) => {
          const cityName = localizePlaceName(city.city, locale);
          const cityPhotos = city.photos?.length
            ? city.photos
            : [
                {
                  id: `cover-${city.id}`,
                  ...city.image,
                  title: city.city,
                  description: "",
                  blurData: "",
                },
              ];

          return (
            <section className={styles.countryCityGroup} key={city.id}>
              <header className={styles.countryCityGroupHeader}>
                <span>{String(cityIndex + 1).padStart(2, "0")}</span>
                <h2>{cityName}</h2>
                <p>{copy.country.cityFrames(city.year, city.photoCount)}</p>
              </header>

              <div className={styles.countryGalleryGrid}>
                {cityPhotos.map((photo, photoIndex) => {
                  const photoTitle = photo.title || copy.common.untitled;

                  return (
                    <button
                      type="button"
                      className={styles.countryGalleryCard}
                      data-motion-image
                      data-motion-parallax
                      data-motion-hover
                      onClick={() =>
                        setSelection({ city, photoId: photo.id })
                      }
                      aria-label={copy.country.openPhoto(
                        photoTitle,
                        cityName,
                        photoIndex + 1,
                        cityPhotos.length,
                      )}
                      key={photo.id}
                    >
                      <div className={styles.countryGalleryImage}>
                        <Image
                          src={photo.url}
                          alt={photoTitle}
                          fill
                          loader={getArchiveImageLoader(photo.url)}
                          priority={cityIndex === 0 && photoIndex < 3}
                          sizes="(max-width: 600px) 92vw, (max-width: 900px) 46vw, 31vw"
                          className={styles.imageCover}
                        />
                        <div className={styles.countryGalleryShade} />
                      </div>
                      <span className={styles.countryGalleryNumber}>
                        {String(photoIndex + 1).padStart(2, "0")}
                      </span>
                      <div className={styles.countryPhotoCopy}>
                        <p>{city.year}</p>
                        <h3>{photoTitle}</h3>
                      </div>
                      <ArrowUpRight
                        className={styles.countryGalleryArrow}
                        size={17}
                        strokeWidth={1.3}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <Link
        href="/map"
        className={styles.countryMapLink}
        data-motion-reveal
        data-motion-hover
      >
        <Map size={17} strokeWidth={1.4} />
        <span>{copy.country.mapLink}</span>
        <ArrowUpRight size={16} strokeWidth={1.4} />
      </Link>

      {selection && (
        <CountryGalleryViewer
          cities={country.cities}
          initialCityId={selection.city.id}
          initialPhotoId={selection.photoId}
          countryCode={country.code}
          countryName={countryName}
          fallbackHref={fallbackHref}
          locale={locale}
          onClose={() => setSelection(null)}
        />
      )}
    </section>
  );
};
