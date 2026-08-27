import { TravelView, type TravelArchive } from "@/modules/travel/ui/views/travel-view";
import { trpc } from "@/trpc/server";

export const metadata = {
  title: "Atlas",
  description: "A geographic index of YueYong's photographic archive.",
};

export const dynamic = "force-dynamic";

const TravelPage = async () => {
  let archive: TravelArchive = { items: [] };

  try {
    archive = await trpc.travel.getArchive({ limit: 60 });
  } catch {
    // The Atlas view provides a local fallback when the remote archive is unavailable.
  }

  return <TravelView archive={archive} />;
};

export default TravelPage;
