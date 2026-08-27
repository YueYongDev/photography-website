import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getJourney, journeys } from "@/modules/journeys/data/journeys";
import { JourneyDetailView } from "@/modules/journeys/ui/views/journey-detail-view";

type Params = Promise<{ slug: string }>;

export const generateStaticParams = () => journeys.map(({ slug }) => ({ slug }));

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const { slug } = await params;
  const journey = getJourney(slug);

  if (!journey) return { title: "Journey not found" };

  return {
    title: journey.title,
    description: journey.description,
    openGraph: { images: [journey.coverImage] },
  };
};

const JourneyPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  const journey = getJourney(slug);

  if (!journey) notFound();

  return <JourneyDetailView journey={journey} />;
};

export default JourneyPage;
