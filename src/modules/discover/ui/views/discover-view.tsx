"use client";

import { MapSection } from "@/modules/discover/ui/sections/map-section";
import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

export const DiscoverView = () => {
  const { copy } = useSiteLocale();

  return (
    <section className={styles.mapPage}>
      <div className={styles.mapIntro}>
        <div>
          <p className={styles.eyebrow}>{copy.discover.eyebrow}</p>
          <h1>{copy.discover.title}</h1>
        </div>
        <p>{copy.discover.lede}</p>
      </div>
      <div className={styles.mapFrame}>
        <MapSection />
      </div>
    </section>
  );
};
