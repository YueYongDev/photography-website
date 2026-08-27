import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Map, Rows3 } from "lucide-react";

import { getCountryGroups } from "@/modules/travel/lib/country-groups";
import styles from "@/modules/site/ui/public-site.module.css";
import type { TravelArchive } from "../views/travel-view";

export const TravelSection = ({ archive }: { archive: TravelArchive }) => {
  const countries = getCountryGroups(archive);
  const cityCount = countries.reduce((total, country) => total + country.cities.length, 0);
  const totalFrames = countries.reduce((total, country) => total + country.frames, 0);

  return (
    <section className={styles.page}>
      <div className={styles.travelIntro}>
        <div>
          <p className={styles.eyebrow}>03 / Travel</p>
          <h1 className={styles.displayTitle}>
            Countries first.
            <br />
            <em>Places within.</em>
          </h1>
        </div>
        <p className={styles.lede}>
          Travel is organized at the scale of a country. Open one to find its
          cities and photographs; use the map when location itself is the way
          you want to browse.
        </p>
      </div>

      <div className={styles.atlasSummary}>
        <div className={styles.atlasStats}>
          <div className={styles.atlasStat}>
            <span>Countries</span>
            <strong>{String(countries.length).padStart(2, "0")}</strong>
          </div>
          <div className={styles.atlasStat}>
            <span>Cities</span>
            <strong>{String(cityCount).padStart(2, "0")}</strong>
          </div>
          <div className={styles.atlasStat}>
            <span>Frames</span>
            <strong>{String(totalFrames).padStart(3, "0")}</strong>
          </div>
        </div>

        <div className={styles.viewSwitch} aria-label="Travel views">
          <Link href="/travel" className={styles.viewActive}>
            <Rows3 size={14} strokeWidth={1.5} /> Countries
          </Link>
          <Link href="/discover">
            <Map size={14} strokeWidth={1.5} /> City map
          </Link>
        </div>
      </div>

      <div className={styles.countryArchive}>
        {countries.map((country, index) => (
          <Link
            href={`/travel/${country.code.toLowerCase()}`}
            className={styles.countryArchiveItem}
            key={country.code}
          >
            <div className={styles.countryArchiveText}>
              <span>T{String(index + 1).padStart(2, "0")} / {country.code}</span>
              <h2>{country.name}</h2>
              <p>{country.cities.map((city) => city.city).join(" · ")}</p>
              <dl>
                <div><dt>Places</dt><dd>{String(country.cities.length).padStart(2, "0")}</dd></div>
                <div><dt>Frames</dt><dd>{String(country.frames).padStart(2, "0")}</dd></div>
                <div><dt>Years</dt><dd>{country.years.join(" / ")}</dd></div>
              </dl>
              <span className={styles.countryArchiveOpen}>
                Open country <ArrowUpRight size={14} strokeWidth={1.4} />
              </span>
            </div>

            <div className={styles.countryArchiveImages}>
              {country.images.map((image, imageIndex) => (
                <div key={image.url} style={{ aspectRatio: image.aspectRatio }}>
                  <Image
                    src={image.url}
                    alt={`${country.name} photograph ${imageIndex + 1}`}
                    fill
                    unoptimized
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
