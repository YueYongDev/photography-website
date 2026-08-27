import { MapSection } from "@/modules/discover/ui/sections/map-section";
import styles from "@/modules/site/ui/public-site.module.css";

export const DiscoverView = () => {
  return (
    <section className={styles.mapPage}>
      <div className={styles.mapIntro}>
        <div>
          <p className={styles.eyebrow}>Atlas / Map</p>
          <h1>Coordinates of the archive.</h1>
        </div>
        <p>
          A geographic view of public photographs. Select a point to return to
          the image or open the nearby group.
        </p>
      </div>
      <div className={styles.mapFrame}>
        <MapSection />
      </div>
    </section>
  );
};
