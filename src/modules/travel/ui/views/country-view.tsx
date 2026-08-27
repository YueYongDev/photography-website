import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Map } from "lucide-react";

import { toPlaceSlug, type TravelCountryGroup } from "@/modules/travel/lib/country-groups";
import styles from "@/modules/site/ui/public-site.module.css";

export const CountryView = ({ country }: { country: TravelCountryGroup }) => {
  const fallbackHref =
    country.code === "NZ"
      ? "/journeys/newzealand-2026"
      : country.code === "UZ"
        ? "/journeys/uzbekistan-2026"
        : "/discover";

  return (
    <section className={styles.page}>
      <Link href="/travel" className={styles.journeyBack}>
        <ArrowLeft size={14} strokeWidth={1.4} /> All countries
      </Link>

      <div className={styles.countryHero}>
        <div>
          <p className={styles.eyebrow}>Travel / {country.code}</p>
          <h1>{country.name}</h1>
        </div>
        <div className={styles.countryHeroMeta}>
          <p>
            One country, seen through {country.cities.length} {country.cities.length === 1 ? "place" : "places"}.
            Cities remain available as chapters inside this national archive.
          </p>
          <dl>
            <div><dt>Places</dt><dd>{String(country.cities.length).padStart(2, "0")}</dd></div>
            <div><dt>Frames</dt><dd>{String(country.frames).padStart(2, "0")}</dd></div>
            <div><dt>Years</dt><dd>{country.years.join(" / ")}</dd></div>
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
            <div className={styles.countryCityImage}>
              <Image
                src={city.image}
                alt={city.city}
                fill
                unoptimized
                priority={index === 0}
                sizes="(min-width: 900px) 34vw, 92vw"
                className={styles.imageCover}
              />
            </div>
            <div className={styles.countryCityCopy}>
              <p>{city.year} · {city.photoCount} frames</p>
              <h2>{city.city}</h2>
            </div>
            <ArrowUpRight size={17} strokeWidth={1.3} />
          </Link>
        ))}
      </div>

      <Link href="/discover" className={styles.countryMapLink}>
        <Map size={17} strokeWidth={1.4} />
        <span>See these cities on the map</span>
        <ArrowUpRight size={16} strokeWidth={1.4} />
      </Link>
    </section>
  );
};
