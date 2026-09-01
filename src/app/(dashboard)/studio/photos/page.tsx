import { PageTransitionContainer } from "@/components/page-transition";
import PhotosView from "@/modules/photos/ui/views/photos-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Photographs",
  description: "Upload photographs and manage archive metadata.",
};

const StudioPhotosPage = () => {
  void trpc.photos.getStudioStats.prefetch();
  void trpc.photos.getManyWithPrivate.prefetchInfinite({
    limit: 40,
    search: undefined,
    selection: "all",
    sort: "newest",
  });

  return (
    <HydrateClient>
      <PageTransitionContainer>
        <PhotosView />
      </PageTransitionContainer>
    </HydrateClient>
  );
};

export default StudioPhotosPage;
