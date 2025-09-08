"use client";

import { ChartsSection } from "../sections/charts-section";
import { StatisticsSection } from "../sections/statistics-section";
import { TravelSection } from "../sections/travel-section";
import { PageTransitionItem } from "@/components/page-transition";
import { trpc } from "@/trpc/client";

export const DashboardView = () => {
  // 在组件顶层调用 useQuery 来触发数据获取
  const citySetsQuery = trpc.travel.getCitySets.useQuery({ limit: 4 });
  const summaryQuery = trpc.summary.getSummary.useQuery();

  return (
    <div className="flex flex-col gap-y-4 py-2.5 px-4 max-w-7xl mx-auto">
      <PageTransitionItem>
        <StatisticsSection />
      </PageTransitionItem>
      <PageTransitionItem>
        <ChartsSection />
      </PageTransitionItem>
      <PageTransitionItem>
        <TravelSection />
      </PageTransitionItem>
    </div>
  );
};
