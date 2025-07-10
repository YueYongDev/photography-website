import { trpc } from "@/trpc/server";
import PhotoScreensaver from "@/components/photo-screensaver";

export default async function ScreensaverPage() {
  const data = await trpc.photos.getMany({
    limit: 32,
  });

  const formattedPhotos =
    data?.items?.map((photo) => ({
      id: photo.id,
      url: photo.url,
      blurData: photo.blurData,
    })) || [];

  return (
    <div className="fixed inset-0">
      <PhotoScreensaver photos={formattedPhotos} className="w-full h-full" />
    </div>
  );
}
