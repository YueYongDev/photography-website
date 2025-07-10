import { ChartsSection } from "../sections/charts-section";
import { StatisticsSection } from "../sections/statistics-section";
import { TravelSection } from "../sections/travel-section";

export const DashboardView = () => {
  return (
    <div className="flex flex-col gap-y-4 py-2.5 px-4 max-w-7xl mx-auto">
      <StatisticsSection />
      <ChartsSection />
      <TravelSection />
    </div>
  );
};
