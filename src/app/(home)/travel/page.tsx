import { TravelView } from "@/modules/travel/ui/views/travel-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const metadata = {
  title: "Travel",
  description: "Travel",
};

export const dynamic = "force-dynamic";

const TravelPage = async () => {
  void trpc.photos.getCitySets.prefetchInfinite({
    limit: 10,
  });

  return (
    <HydrateClient>
      <TravelView />
    </HydrateClient>
  );
};

export default TravelPage;
