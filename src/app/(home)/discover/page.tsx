import { DiscoverView } from "@/modules/discover/ui/views/discover-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Map",
  description:
    "A city-level map of YueYong's public photographic archive.",
};

const DiscoverPage = () => <DiscoverView />;

export default DiscoverPage;
