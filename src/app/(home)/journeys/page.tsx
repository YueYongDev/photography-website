import type { Metadata } from "next";

import type { PublicJourneyStory } from "@/modules/journeys/types";
import { JourneysView } from "@/modules/journeys/ui/views/journeys-view";
import { trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Journeys",
  description: "Journey photographs and notes by YueYong.",
};

const JourneysPage = async () => {
  let stories: PublicJourneyStory[] = [];

  try {
    const result = await trpc.blog.getJourneyIndex({ limit: 24 });
    stories = result.map((story) => ({
      ...story,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    }));
  } catch {
    // Structured journeys remain available if the field-note archive is offline.
  }

  return <JourneysView stories={stories} />;
};

export default JourneysPage;
