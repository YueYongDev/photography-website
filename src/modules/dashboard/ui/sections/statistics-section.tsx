"use client";

import { StatisticsCard } from "../components/statistics-card";
import { trpc } from "@/trpc/client";
import styles from "../studio.module.css";

export const StatisticsSection = () => {
  const { data: summary, isLoading } = trpc.summary.getSummary.useQuery();

  if (isLoading) {
    return (
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.stat}>
            <div className={`${styles.skeletonBlock} h-3 w-20`} />
            <div className={`${styles.skeletonBlock} h-12 w-24`} />
          </div>
        ))}
      </div>
    );
  }

  const yearlyStats = summary?.data?.yearlyStats || {};
  const years = Object.keys(yearlyStats)
    .map(Number)
    .sort((a, b) => b - a);

  const currentYear = years[0];
  const lastYear = years[1];
  const currentYearCount = yearlyStats[currentYear] || 0;
  const lastYearCount = yearlyStats[lastYear] || 0;

  const direction = currentYearCount >= lastYearCount ? "up" : "down";
  const growthPercentage =
    lastYearCount === 0
      ? 0
      : Math.round(((currentYearCount - lastYearCount) / lastYearCount) * 100);

  return (
    <div className={styles.statsGrid}>
      <StatisticsCard
        index="01"
        title="Total photos"
        value={summary?.data?.photoCount || 0}
        direction={direction}
        percentage={growthPercentage}
      />
      <StatisticsCard
        index="02"
        title="Mapped places"
        value={summary?.data?.cityCount || 0}
      />
      <StatisticsCard
        index="03"
        title="Journey notes"
        value={summary?.data?.postCount || 0}
      />
      <StatisticsCard
        index="04"
        title="Selected work"
        value={summary?.data?.favoriteCount || 0}
      />
    </div>
  );
};
