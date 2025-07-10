import { HydrateClient, trpc } from "@/trpc/server";
import PhotosView from "@/modules/photos/ui/views/photos-view";

export const dynamic = "force-dynamic";

const page = async () => {
  void trpc.photos.getManyWithPrivate.prefetchInfinite({
    limit: 10,
  });

  return (
    <HydrateClient>
      <PhotosView />
    </HydrateClient>
  );
};

export default page;
