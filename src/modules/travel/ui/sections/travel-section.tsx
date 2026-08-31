"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Map, Rows3 } from "lucide-react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import {
  localizeCountryName,
  localizePlaceName,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import { getCountryGroups } from "@/modules/travel/lib/country-groups";
import styles from "@/modules/site/ui/public-site.module.css";
import type { TravelArchive } from "../views/travel-view";

export const TravelSection = ({ archive }: { archive: TravelArchive }) => {
  const { copy, locale } = useSiteLocale();
  const countries = getCountryGroups(archive);
  const cityCount = countries.reduce(
    (total, country) => total + country.cities.length,
    0,
  );
  const totalFrames = countries.reduce(
    (total, country) => total + country.frames,
    0,
  );

  return (
    <section className={styles.page}>
      <div className={styles.travelIntro}>
        <div data-motion-reveal="left">
          <p className={styles.eyebrow}>{copy.travel.eyebrow}</p>
          <h1 className={styles.displayTitle}>{copy.travel.title}</h1>
        </div>
        <div className={styles.travelLede} data-motion-reveal="right">
          <p className={styles.lede}>{copy.travel.description}</p>
          {copy.travel.attribution && (
            <cite className={styles.travelAttribution}>
              {copy.travel.attribution}
            </cite>
          )}
        </div>
      </div>

      <div className={styles.atlasSummary} data-motion-reveal>
        <div className={styles.atlasStats}>
          <div className={styles.atlasStat}>
            <span>{copy.travel.countries}</span>
            <strong>{String(countries.length).padStart(2, "0")}</strong>
          </div>
          <div className={styles.atlasStat}>
            <span>{copy.travel.cities}</span>
            <strong>{String(cityCount).padStart(2, "0")}</strong>
          </div>
          <div className={styles.atlasStat}>
            <span>{copy.common.frames}</span>
            <strong>{String(totalFrames).padStart(3, "0")}</strong>
          </div>
        </div>

        <div className={styles.viewSwitch} aria-label={copy.travel.viewsLabel}>
          <Link href="/places" className={styles.viewActive} aria-current="page">
            <Rows3 size={15} strokeWidth={1.5} /> {copy.travel.countries}
          </Link>
          <Link href="/map">
            <Map size={15} strokeWidth={1.5} /> {copy.travel.cityMap}
          </Link>
        </div>
      </div>

      <div className={styles.countryArchive}>
        {countries.map((country, index) => (
          <Link
            href={`/places/${country.code.toLowerCase()}`}
            className={styles.countryArchiveItem}
            data-motion-reveal
            data-motion-hover
            key={country.code}
          >
            <div className={styles.countryArchiveText}>
              <span>
                T{String(index + 1).padStart(2, "0")} / {country.code}
              </span>
              <h2>{localizeCountryName(country.name, country.code, locale)}</h2>
              <p>
                {country.cities
                  .map((city) => localizePlaceName(city.city, locale))
                  .join(" · ")}
              </p>
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
              <span className={styles.countryArchiveOpen}>
                {copy.travel.openCountry}{" "}
                <ArrowUpRight size={15} strokeWidth={1.4} />
              </span>
            </div>

            <div
              className={styles.countryArchiveImages}
              data-motion-parallax
            >
              {country.images.map((image, imageIndex) => (
                <div
                  key={image.url}
                  style={{
                    aspectRatio:
                      image.width > 0 && image.height > 0
                        ? image.width / image.height
                        : image.aspectRatio,
                  }}
                >
                  <Image
                    src={image.url}
                    alt={`${localizeCountryName(country.name, country.code, locale)} ${
                      locale === "zh-CN"
                        ? `照片 ${String(imageIndex + 1).padStart(2, "0")}`
                        : `photograph ${imageIndex + 1}`
                    }`}
                    fill
                    loader={getArchiveImageLoader(image.url)}
                    priority={index === 0}
                    sizes="(min-width: 900px) 22vw, 45vw"
                    className={styles.imageContain}
                  />
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
