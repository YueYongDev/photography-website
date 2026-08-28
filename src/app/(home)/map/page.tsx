import { DiscoverView } from "@/modules/discover/ui/views/discover-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Map",
  description: "Explore YueYong's photographic archive across an interactive world map.",
};

const MapPage = () => <DiscoverView />;

export default MapPage;
