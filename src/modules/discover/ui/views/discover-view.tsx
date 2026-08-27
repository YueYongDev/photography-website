import { MapSection } from "@/modules/discover/ui/sections/map-section";
import styles from "@/modules/site/ui/public-site.module.css";

export const DiscoverView = () => {
  return (
    <section className={styles.mapPage}>
      <div className={styles.mapIntro}>
        <div>
          <p className={styles.eyebrow}>04 / Map</p>
          <h1>Cities of the archive.</h1>
        </div>
        <p>
          One point for each city in the public archive. Select a point to see
          its photographs, or open the city inside its country.
        </p>
      </div>
      <div className={styles.mapFrame}>
        <MapSection />
      </div>
    </section>
  );
};
