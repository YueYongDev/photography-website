import { HydrateClient, trpc } from "@/trpc/server";
import { HomeView } from "@/modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

const page = async () => {
  void trpc.photos.getCitySets.prefetch({
    limit: 12,
  });
  void trpc.photos.getLikedPhotos.prefetch({
    limit: 10,
  });

  return (
    <HydrateClient>
      <HomeView />
    </HydrateClient>
  );
};

export default page;
