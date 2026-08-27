import type { Metadata } from "next";

import { WorkView, type WorkPhoto } from "@/modules/work/ui/views/work-view";
import { trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected photographs by YueYong.",
};

const WorkPage = async () => {
  let photos: WorkPhoto[] = [];

  try {
    const result = await trpc.photos.getLikedPhotos({ limit: 48 });
    photos = result.map((photo, index) => ({
      ...photo,
      sequence: index + 1,
    }));
  } catch {
    // Keep the editorial selection honest when the archive is unavailable.
  }

  return <WorkView photos={photos} />;
};

export default WorkPage;
