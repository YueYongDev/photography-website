"use client";

import { ErrorBoundary } from "react-error-boundary";
import { TravelPhotos } from "../components/travel-photos";
import { trpc } from "@/trpc/client";
import dynamic from "next/dynamic";
import styles from "../studio.module.css";

const TravelMap = dynamic(
  () => import("../components/travel-map").then((module) => module.TravelMap),
  {
    ssr: false,
    loading: () => <div className={`${styles.mapFrame} ${styles.skeletonBlock}`} />,
  }
);

export const TravelSection = () => {
  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <TravelSectionContent />
    </ErrorBoundary>
  );
};

export const TravelSectionSkeleton = () => {
  return (
    <section className={styles.travelBlock}>
      <div className={styles.sectionLabel}>
        <p>Recent geography</p>
        <span>Places with coordinates</span>
      </div>
      <div className={styles.travelGrid}>
        <div className={styles.travelList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${styles.travelRow} ${styles.skeletonBlock}`} />
          ))}
        </div>
        <div className={`${styles.mapFrame} ${styles.skeletonBlock}`} />
      </div>
    </section>
  );
};

const TravelSectionContent = () => {
  const { data, isLoading } = trpc.travel.getCitySets.useQuery({
    limit: 4,
  });

  if (isLoading) {
    return <TravelSectionSkeleton />;
  }

  return (
    <section className={styles.travelBlock}>
      <div className={styles.sectionLabel}>
        <p>Recent geography</p>
        <span>Places with coordinates</span>
      </div>
      <div className={styles.travelGrid}>
        <TravelPhotos data={data?.items || []} />
        <TravelMap data={data?.items || []} />
      </div>
    </section>
  );
};
