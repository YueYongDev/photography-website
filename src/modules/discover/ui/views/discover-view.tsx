import VectorCombined from "@/components/vector-combined";
import { MapSection } from "@/modules/discover/ui/sections/map-section";

export const DiscoverView = () => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <MapSection />
      <div className="absolute right-0 bottom-0 z-10">
        <VectorCombined title="Discover" position="bottom-right" />
      </div>
    </div>
  );
};
