export type JourneyStatus = "planning" | "live" | "archived";

export type JourneyMeta = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  status: JourneyStatus;
  startDate: string;
  endDate?: string;
  locations: string[];
  theme: string;
  coverImage: string;
  href: string;
  featured: boolean;
};

export const journeys: JourneyMeta[] = [
  {
    slug: "uzbekistan-2026",
    title: "Uzbekistan 2026",
    subtitle: "A Silk Road field notebook",
    description:
      "A standalone visual journey through Tashkent, Bukhara and Samarkand, built as its own site and served under the main domain.",
    status: "live",
    startDate: "2026-02-17",
    endDate: "2026-02-24",
    locations: ["Tashkent", "Bukhara", "Samarkand"],
    theme: "Silk Road blue, winter gold, field notes",
    coverImage: "https://cdn.ytools.xyz/photos/DSC00614-1771667465746.jpg?imageView2/2/w/3840/q/75|imageslim",
    href: "/journeys/uzbekistan-2026",
    featured: true,
  },
];

export const featuredJourneys = journeys.filter((journey) => journey.featured);
