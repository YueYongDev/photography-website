"use client";

import { PhotosByYearLineChart } from "../components/photos-by-year-line-chart";
import { PhotosByCityBarChart } from "../components/photos-by-city-bar-chart";
import { trpc } from "@/trpc/client";

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
