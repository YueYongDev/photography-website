export type PublicJourneyStory = {
  id: string;
  title: string;
  slug: string;
  tags: string[] | null;
  coverImage: string | null;
  description: string | null;
  content?: string | null;
  readingTimeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
};
