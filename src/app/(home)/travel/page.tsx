import { TravelView } from "@/modules/travel/ui/views/travel-view";
import { trpc } from "@/trpc/server";

export const metadata = {
  title: "Travel Archive",
  description: "Field notes and photographic journals from cities around the world.",
};

export const dynamic = "force-dynamic";

const TravelPage = async () => {
  const archive = await trpc.travel.getArchive({ limit: 60 });

  return <TravelView archive={archive} />;
};

export default TravelPage;
