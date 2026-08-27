"use client";

import { trpc } from "@/trpc/client";
import dynamic from "next/dynamic";
import styles from "../studio.module.css";
import { useLazyVisibility } from "@/hooks/use-lazy-visibility";

const ChartLoading = () => (
  <div className={`${styles.skeletonBlock} min-h-80 bg-muted`} />
);

const PhotosByYearLineChart = dynamic(
  () =>
    import("../components/photos-by-year-line-chart").then(
      (module) => module.PhotosByYearLineChart,
    ),
  { loading: ChartLoading },
);

const PhotosByCityBarChart = dynamic(
  () =>
    import("../components/photos-by-city-bar-chart").then(
      (module) => module.PhotosByCityBarChart,
    ),
  { loading: ChartLoading },
);

export const ChartsSection = () => {
  const { data: summary, isLoading } = trpc.summary.getSummary.useQuery();
  const { targetRef, shouldRender } = useLazyVisibility();

  if (isLoading) {
    return (
      <div className={styles.chartsGrid}>
        <div className={`${styles.skeletonBlock} min-h-80`} />
        <div className={`${styles.skeletonBlock} min-h-80`} />
      </div>
    );
  }

  return (
    <div className={styles.chartsGrid} ref={targetRef}>
      {shouldRender ? (
        <>
          <PhotosByYearLineChart data={summary?.data?.yearlyStats || {}} />
          <PhotosByCityBarChart data={summary?.data?.topCities || []} />
        </>
      ) : (
        <>
          <ChartLoading />
          <ChartLoading />
        </>
      )}
    </div>
  );
};
