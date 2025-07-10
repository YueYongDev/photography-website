import PhotoView from "@/modules/photos/ui/views/photo-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PhotoIdPageProps {
  params: Promise<{ photoId: string }>;
}

const PhotoIdPage = async ({ params }: PhotoIdPageProps) => {
  const { photoId } = await params;
  void trpc.photos.getOne.prefetch({ id: photoId });

  return (
    <HydrateClient>
      <PhotoView photoId={photoId} />
    </HydrateClient>
  );
};

export default PhotoIdPage;
