"use client";

import { ErrorBoundary } from "react-error-boundary";
import { TravelPhotos } from "../components/travel-photos";
import { trpc } from "@/trpc/client";
import dynamic from "next/dynamic";
import styles from "../studio.module.css";
import type { DashboardTravelCitySet } from "../components/travel-types";
import { useLazyVisibility } from "@/hooks/use-lazy-visibility";
import { useStudioLocale } from "../../i18n/studio-locale";

const TravelMap = dynamic(
  () => import("../components/travel-map").then((module) => module.TravelMap),
  {
    ssr: false,
    loading: () => (
      <div className={`${styles.mapFrame} ${styles.skeletonBlock}`} />
    ),
  },
);

const LazyTravelMap = ({ data }: { data: DashboardTravelCitySet[] }) => {
  const { targetRef, shouldRender } = useLazyVisibility("400px");

  return (
    <div className={styles.mapGate} ref={targetRef}>
      {shouldRender ? (
        <TravelMap data={data} />
      ) : (
        <div className={`${styles.mapFrame} ${styles.skeletonBlock}`} />
      )}
    </div>
  );
};

export const TravelSection = () => {
  const { copy } = useStudioLocale();
  return (
    <ErrorBoundary fallback={<p>{copy.overview.error}</p>}>
      <TravelSectionContent />
    </ErrorBoundary>
  );
};

export const TravelSectionSkeleton = () => {
  const { copy } = useStudioLocale();
  return (
    <section className={styles.travelBlock}>
      <div className={styles.sectionLabel}>
        <p>{copy.overview.recentGeography}</p>
        <span>{copy.overview.coordinates}</span>
      </div>
      <div className={styles.travelGrid}>
        <div className={styles.travelList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`${styles.travelRow} ${styles.skeletonBlock}`}
            />
          ))}
        </div>
        <div className={`${styles.mapFrame} ${styles.skeletonBlock}`} />
      </div>
    </section>
  );
};

const TravelSectionContent = () => {
  const { copy } = useStudioLocale();
  const { data, isLoading } = trpc.travel.getCitySets.useQuery({
    limit: 4,
  });

  if (isLoading) {
    return <TravelSectionSkeleton />;
  }

  return (
    <section className={styles.travelBlock}>
      <div className={styles.sectionLabel}>
        <p>{copy.overview.recentGeography}</p>
        <span>{copy.overview.coordinates}</span>
      </div>
      <div className={styles.travelGrid}>
        <TravelPhotos data={data?.items || []} />
        <LazyTravelMap data={data?.items || []} />
      </div>
    </section>
  );
};
