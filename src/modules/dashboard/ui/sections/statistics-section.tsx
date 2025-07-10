"use client";

import { StatisticsCard } from "../components/statistics-card";
import { trpc } from "@/trpc/client";

export const StatisticsSection = () => {
  const [summary] = trpc.summary.getSummary.useSuspenseQuery();
  const yearlyStats = summary.data?.yearlyStats || {};
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatisticsCard
        title="Total photos"
        value={summary.data?.photoCount || 0}
        direction={direction}
        percentage={growthPercentage}
      />
      <StatisticsCard
        title="Total travel cities"
        value={summary.data?.cityCount || 0}
      />
      <StatisticsCard
        title="Total posts"
        value={summary.data?.postCount || 0}
      />
      <StatisticsCard title="Likes" value={1000} />
    </div>
  );
};
