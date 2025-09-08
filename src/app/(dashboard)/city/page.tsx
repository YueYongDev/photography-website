import { TravelView } from "@/modules/travel/ui/views/travel-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const metadata = {
  title: "City Sets",
  description: "City Sets",
};

export const dynamic = "force-dynamic";

const CityPage = async () => {
  void trpc.photos.getCitySets.prefetchInfinite({
    limit: 10,
  });

  return (
    <HydrateClient>
      <TravelView />
    </HydrateClient>
  );
};

export default CityPage;
