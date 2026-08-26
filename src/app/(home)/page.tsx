import { HydrateClient, trpc } from "@/trpc/server";
import { HomeView } from "@/modules/home/ui/views/home-view";

// The HTML remains request-aware, while the database reads below are cached
// independently. This also keeps deployment builds from depending on the DB.
export const dynamic = "force-dynamic";

const page = async () => {
  await Promise.all([
    trpc.photos.getCitySetsPreview.prefetchInfinite({
      limit: 12,
    }),
    trpc.photos.getLikedPhotos.prefetch({
      limit: 10,
    }),
  ]);

  return (
    <HydrateClient>
      <HomeView />
    </HydrateClient>
  );
};

export default page;
