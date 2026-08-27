import type { Metadata } from "next";

import { JourneysView } from "@/modules/journeys/ui/views/journeys-view";

export const metadata: Metadata = {
  title: "Journeys",
  description:
    "Long-form photographic stories by YueYong, kept together in one archive.",
};

const JourneysPage = () => {
  return <JourneysView />;
};

export default JourneysPage;
