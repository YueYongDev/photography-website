import {
  HomeView,
  type HomeSelectedPhoto,
} from "@/modules/home/ui/views/home-view";
import { trpc } from "@/trpc/server";
import { connection } from "next/server";

const page = async () => {
  let selectedPhotos: HomeSelectedPhoto[] = [];

  try {
    // The homepage is a fresh edit of the selected pool on every request.
    await connection();
    selectedPhotos = await trpc.photos.getSelectedPhotos({
      limit: 9,
      random: true,
    });
  } catch {
    // The page shell and the rest of the archive remain available.
  }

  return <HomeView selectedPhotos={selectedPhotos} />;
};

export default page;
