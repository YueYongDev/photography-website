import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getJourney, journeys } from "@/modules/journeys/data/journeys";
import type { PublicJourneyStory } from "@/modules/journeys/types";
import { JourneyDetailView } from "@/modules/journeys/ui/views/journey-detail-view";
import { JourneyStoryView } from "@/modules/journeys/ui/views/journey-story-view";
import { trpc } from "@/trpc/server";

type Params = Promise<{ slug: string }>;

export const generateStaticParams = () =>
  journeys.map(({ slug }) => ({ slug }));

const getPublicStory = cache(async (slug: string) => {
  try {
    const story = await trpc.blog.getOne({ slug });
    return {
      ...story,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    } satisfies PublicJourneyStory;
  } catch {
    return null;
  }
});

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  const { slug } = await params;
  const journey = getJourney(slug);

  if (journey) {
    return {
      title: journey.title,
      description: journey.description,
      openGraph: journey.coverImage
        ? { images: [journey.coverImage] }
        : undefined,
    };
  }

  const story = await getPublicStory(slug);
  if (!story) return { title: "Journey not found" };

  return {
    title: story.title,
    description: story.description || undefined,
    openGraph: story.coverImage ? { images: [story.coverImage] } : undefined,
  };
};

const JourneyPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  const journey = getJourney(slug);

  if (journey) return <JourneyDetailView journey={journey} />;

  const story = await getPublicStory(slug);
  if (!story) notFound();

  return <JourneyStoryView story={story} />;
};

export default JourneyPage;
