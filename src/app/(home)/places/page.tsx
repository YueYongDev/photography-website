import {
  TravelView,
  type TravelArchive,
} from "@/modules/travel/ui/views/travel-view";
import { trpc } from "@/trpc/server";

export const metadata = {
  title: "Places",
  description: "Photographs by country and city.",
};

export const dynamic = "force-dynamic";

const PlacesPage = async () => {
  let archive: TravelArchive = { items: [] };

  try {
    archive = await trpc.travel.getArchive({ limit: 60 });
  } catch {
    // The Places view provides a local fallback when the remote archive is unavailable.
  }

  return <TravelView archive={archive} />;
};

export default PlacesPage;
