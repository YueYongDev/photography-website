import type { Metadata } from "next";

import { SiteConceptView } from "@/modules/concept/ui/views/site-concept-view";

export const metadata: Metadata = {
  title: "Site Concept",
  description:
    "A work-led concept for YueYong Photography: selected work, journeys, and a geographic atlas.",
};

export default function ConceptPage() {
  return <SiteConceptView />;
}
