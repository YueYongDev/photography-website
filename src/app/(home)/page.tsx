import {
  HomeView,
  type HomeSelectedPhoto,
} from "@/modules/home/ui/views/home-view";
import { trpc } from "@/trpc/server";

const page = async () => {
  let selectedPhotos: HomeSelectedPhoto[] = [];

  try {
    selectedPhotos = await trpc.photos.getLikedPhotos({ limit: 9 });
  } catch {
    // The page shell and the rest of the archive remain available.
  }

  return <HomeView selectedPhotos={selectedPhotos} />;
};

export default page;
