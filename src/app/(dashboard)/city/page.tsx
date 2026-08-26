import { TravelView } from "@/modules/travel/ui/views/travel-view";
import { trpc } from "@/trpc/server";

export const metadata = {
  title: "City Sets",
  description: "City Sets",
};

export const dynamic = "force-dynamic";

const CityPage = async () => {
  const archive = await trpc.travel.getArchive({ limit: 60 });

  return <TravelView archive={archive} />;
};

export default CityPage;
