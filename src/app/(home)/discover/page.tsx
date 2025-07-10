import { HydrateClient, trpc } from "@/trpc/server";
import { DiscoverView } from "@/modules/discover/ui/views/discover-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Discover",
  description:
    "Capturing memories across the globe - A visual journey through time and space",
};

const DiscoverPage = async () => {
  void trpc.map.getMany.prefetch();

  return (
    <HydrateClient>
      <DiscoverView />
    </HydrateClient>
  );
};

export default DiscoverPage;
