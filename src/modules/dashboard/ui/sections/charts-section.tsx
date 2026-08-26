"use client";

import { trpc } from "@/trpc/client";
import dynamic from "next/dynamic";

const ChartLoading = () => <div className="h-64 rounded-lg bg-muted" />;

const PhotosByYearLineChart = dynamic(
  () =>
    import("../components/photos-by-year-line-chart").then(
      (module) => module.PhotosByYearLineChart
    ),
  { loading: ChartLoading }
);

const PhotosByCityBarChart = dynamic(
  () =>
    import("../components/photos-by-city-bar-chart").then(
      (module) => module.PhotosByCityBarChart
    ),
  { loading: ChartLoading }
);

export const ChartsSection = () => {
  const { data: summary, isLoading } = trpc.summary.getSummary.useQuery();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <PhotosByYearLineChart data={summary?.data?.yearlyStats || {}} />
      <PhotosByCityBarChart data={summary?.data?.topCities || []} />
    </div>
  );
};
