"use client";

import { PhotosByYearLineChart } from "../components/photos-by-year-line-chart";
import { PhotosByCityBarChart } from "../components/photos-by-city-bar-chart";
import { trpc } from "@/trpc/client";

export const ChartsSection = () => {
  const [summary] = trpc.summary.getSummary.useSuspenseQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <PhotosByYearLineChart data={summary.data?.yearlyStats || {}} />
      <PhotosByCityBarChart data={summary.data?.topCities || []} />
    </div>
  );
};
