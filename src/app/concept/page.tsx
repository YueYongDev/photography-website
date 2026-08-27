import type { Metadata } from "next";

import { SiteConceptView } from "@/modules/concept/ui/views/site-concept-view";

export const metadata: Metadata = {
  title: "Site Concept",
  description: "YueYong Photography site concept.",
};

export default function ConceptPage() {
  return <SiteConceptView />;
}
