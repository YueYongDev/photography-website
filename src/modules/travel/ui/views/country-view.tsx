"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Map } from "lucide-react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import {
  toPlaceSlug,
  type TravelCountryGroup,
} from "@/modules/travel/lib/country-groups";
import styles from "@/modules/site/ui/public-site.module.css";

export const CountryView = ({ country }: { country: TravelCountryGroup }) => {
  const { copy, locale } = useSiteLocale();
  const countryName = localizeCountryName(country.name, country.code, locale);
  const fallbackHref =
    country.code === "NZ"
      ? "/journeys/newzealand-2026"
      : country.code === "UZ"
        ? "/journeys/uzbekistan-2026"
        : "/discover";

  return (
    <section className={styles.page}>
      <Link href="/travel" className={styles.journeyBack}>
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
          <p>{copy.country.intro(country.cities.length)}</p>
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

      <div className={styles.countryCityList}>
        {country.cities.map((city, index) => (
          <Link
            href={
              city.id.startsWith("fallback-")
                ? fallbackHref
                : `/travel/${country.code.toLowerCase()}/${toPlaceSlug(city.city)}`
            }
            className={styles.countryCityRow}
            key={city.id}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div
              className={styles.countryCityImage}
              style={{
                aspectRatio:
                  city.image.width > 0 && city.image.height > 0
                    ? city.image.width / city.image.height
                    : city.image.aspectRatio,
              }}
            >
              <Image
                src={city.image.url}
                alt={localizePlaceName(city.city, locale)}
                fill
                loader={getArchiveImageLoader(city.image.url)}
                priority={index === 0}
                sizes="(min-width: 900px) 34vw, 92vw"
                className={styles.imageContain}
              />
            </div>
            <div className={styles.countryCityCopy}>
              <p>{copy.country.cityFrames(city.year, city.photoCount)}</p>
              <h2>{localizePlaceName(city.city, locale)}</h2>
            </div>
            <ArrowUpRight size={17} strokeWidth={1.3} />
          </Link>
        ))}
      </div>

      <Link href="/discover" className={styles.countryMapLink}>
        <Map size={17} strokeWidth={1.4} />
        <span>{copy.country.mapLink}</span>
        <ArrowUpRight size={16} strokeWidth={1.4} />
      </Link>
    </section>
  );
};
