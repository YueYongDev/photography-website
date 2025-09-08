"use client";

import { ChartsSection } from "../sections/charts-section";
import { StatisticsSection } from "../sections/statistics-section";
import { TravelSection } from "../sections/travel-section";
import { PageTransitionItem } from "@/components/page-transition";
// Removed unused trpc import

export const DashboardView = () => {
  // 移除了未使用的 citySetsQuery 和 summaryQuery

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
