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
  {
    slug: "saga-2025",
    title: "Saga 2025",
    subtitle: "Along the edge of the world",
    description:
      "A journey through remote coastlines and ancient landscapes, tracing the edges of the known world.",
    status: "planning",
    startDate: "2025-07-10",
    endDate: "2025-07-20",
    locations: ["TBD"],
    theme: "Mist, stone, open sea",
    coverImage:
      "https://cdn.ytools.xyz/photos/IMG_5103-1758261902190.JPG?imageView2/2/w/3840/q/75|imageslim",
    href: "/journeys/saga-2025",
    featured: false,
  },
  {
    slug: "norway-2025",
    title: "Norway 2025",
    subtitle: "Fjords and silence",
    description:
      "A slow drive through Flåm, Geiranger and the Lofoten archipelago — chasing winter light at the edge of the Arctic.",
    status: "planning",
    startDate: "2025-11-18",
    endDate: "2025-11-27",
    locations: ["Flåm", "Geiranger", "Lofoten"],
    theme: "Steel blue, snow white, fjord grey",
    coverImage:
      "https://cdn.ytools.xyz/photos/C9884F12-91DB-41CB-98BC-ED10F7988041-1759828372723.JPG?imageView2/2/w/3840/q/50|imageslim",
    href: "/journeys/norway-2025",
    featured: false,
  },
  {
    slug: "turkiye-2025",
    title: "Türkiye 2025",
    subtitle: "Between two continents",
    description:
      "Istanbul, Cappadocia and the Aegean coast — ancient architecture, hot-air balloons at dawn, and the Bosphorus at dusk.",
    status: "planning",
    startDate: "2025-09-05",
    endDate: "2025-09-15",
    locations: ["Istanbul", "Cappadocia", "Bodrum"],
    theme: "Terracotta, turquoise, Ottoman mosaic",
    coverImage:
      "https://cdn.ytools.xyz/photos/DSC04684-1752423812278.jpeg?imageView2/2/w/3840/q/75|imageslim",
    href: "/journeys/turkiye-2025",
    featured: false,
  },
  {
    slug: "iceland-2025",
    title: "Iceland 2025",
    subtitle: "Fire, ice and long exposure nights",
    description:
      "Chasing the northern lights across Reykjavik, Vík and the Snæfellsnes peninsula — a week of volcanic landscapes and midnight skies.",
    status: "planning",
    startDate: "2025-10-03",
    endDate: "2025-10-10",
    locations: ["Reykjavik", "Vík í Mýrdal", "Snæfellsnes"],
    theme: "Glacial grey, aurora green, long exposure",
    coverImage:
      "https://cdn.ytools.xyz/photos/a56af6d2ade2f278587b32d922431071-1759831612512.JPG?imageView2/2/w/3840/q/75|imageslim",
    href: "/journeys/iceland-2025",
    featured: false,
  },
];

export const featuredJourneys = journeys.filter((journey) => journey.featured);
