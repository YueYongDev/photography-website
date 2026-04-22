import type { Metadata } from "next";

import { JourneysView } from "@/modules/journeys/ui/views/journeys-view";

export const metadata: Metadata = {
  title: "Journeys",
  description:
    "A hub for YueYong's standalone visual journeys, served from the main domain.",
};

const JourneysPage = () => {
  return <JourneysView />;
};

export default JourneysPage;
