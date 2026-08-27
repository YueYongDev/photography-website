import type { Metadata } from "next";

import { WorkView, type WorkPhoto } from "@/modules/work/ui/views/work-view";
import { trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected photography by YueYong, arranged as recurring ways of seeing.",
};

export const dynamic = "force-dynamic";

const fallbackPhotos: WorkPhoto[] = [
  ["08-tekapo-quiet.jpg", "Quiet Distances", "Tekapo", "NZ"],
  ["03-lindis-road.jpg", "Passing Through", "Lindis Pass", "NZ"],
  ["06-tekapo-portrait.jpg", "The Observer", "Tekapo", "NZ"],
  ["04-glenorchy-peak.jpg", "Roadside Study", "Glenorchy", "NZ"],
  ["05-tekapo-pano.jpg", "Southern Light", "Tekapo", "NZ"],
  ["07-wanaka-camera.jpg", "Field Tools", "Wānaka", "NZ"],
].map(([file, title, city, countryCode], index) => ({
  id: null,
  url: `/journeys/newzealand-2026/photos/${file}`,
  title,
  city,
  countryCode,
  dateTimeOriginal: null,
  sequence: index + 1,
}));

const WorkPage = async () => {
  let photos = fallbackPhotos;

  try {
    const result = await trpc.photos.getMany({ limit: 48 });
    if (result.items.length > 0) {
      photos = result.items.map((photo, index) => ({
        id: photo.id,
        url: photo.url,
        title: photo.title,
        city: photo.city,
        countryCode: photo.countryCode,
        dateTimeOriginal: photo.dateTimeOriginal,
        sequence: index + 1,
      }));
    }
  } catch {
    // The local photographic fallback keeps the public portfolio available
    // when the remote archive is temporarily unreachable.
  }

  return <WorkView photos={photos} />;
};

export default WorkPage;
