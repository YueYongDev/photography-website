import { PageTransitionContainer } from "@/components/page-transition";
import { TravelSection } from "../sections/travel-section";

export const TravelView = () => {
  return (
    <PageTransitionContainer className="flex flex-col lg:flex-row min-h-screen w-full">
      <TravelSection />
    </PageTransitionContainer>
  );
};
