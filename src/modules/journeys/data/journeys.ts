export type JourneyFrame = {
  src: string;
  alt: string;
  caption: string;
  location: string;
  format?: "landscape" | "portrait" | "wide";
};

export type JourneyChapter = {
  number: string;
  title: string;
  place: string;
  paragraphs: string[];
  frame?: JourneyFrame;
};

export type JourneyMeta = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  country: string;
  countryCode: string;
  dates: string;
  year: string;
  route: string[];
  coverImage: string;
  coverAlt: string;
  intro: string;
  chapters: JourneyChapter[];
  frames: JourneyFrame[];
  closing: string;
};

export const journeys: JourneyMeta[] = [
  {
    slug: "newzealand-2026",
    title: "South Island",
    subtitle: "Seven days beneath the Southern Alps",
    description:
      "A road journal through autumn light, glacial water, and the long distances between Queenstown and Aoraki.",
    country: "New Zealand",
    countryCode: "NZ",
    dates: "26 April — 02 May 2026",
    year: "2026",
    route: ["Queenstown", "Glenorchy", "Wānaka", "Tekapo", "Aoraki"],
    coverImage: "/journeys/newzealand-2026/photos/01-cover-mt-cook.jpg",
    coverAlt: "The road toward Aoraki / Mount Cook",
    intro:
      "The South Island was not a checklist of viewpoints. It was a week measured in changing weather, roadside pauses, and the moment a familiar landscape became briefly personal.",
    chapters: [
      {
        number: "01",
        title: "The road sets the pace",
        place: "Lindis Pass",
        paragraphs: [
          "Leaving Queenstown, the land opened faster than the itinerary. Roads became the connecting tissue of the trip: long, pale lines that turned distance into part of the photograph.",
          "The best frames arrived between the named places, when there was nothing to do but stop, look, and let the weather finish the composition.",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/03-lindis-road.jpg",
          alt: "A road crossing the open landscape near Lindis Pass",
          caption: "The route became a subject of its own.",
          location: "Lindis Pass",
          format: "wide",
        },
      },
      {
        number: "02",
        title: "Mountains at eye level",
        place: "Glenorchy",
        paragraphs: [
          "At Glenorchy the mountains felt less like a backdrop and more like a wall. Scale was everywhere, but the quieter question was how a person moves through it.",
          "A small figure, a narrow road, a single ridge catching light — those proportions say more about the place than a grand panorama alone.",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/04-glenorchy-peak.jpg",
          alt: "Mountain light above Glenorchy",
          caption: "Evening light on the edge of the range.",
          location: "Glenorchy",
          format: "portrait",
        },
      },
      {
        number: "03",
        title: "A quieter blue",
        place: "Lake Tekapo",
        paragraphs: [
          "Tekapo is often described by its colour. What stayed with me was the space around it: wind across the shore, a person reduced to a mark, and the way silence changes the scale of a frame.",
          "This was the point where the journey stopped feeling like travel documentation and began to resemble the work I wanted to keep making.",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
          alt: "A solitary person on the shore of Lake Tekapo",
          caption: "A small human trace beside the lake.",
          location: "Lake Tekapo",
          format: "portrait",
        },
      },
    ],
    frames: [
      {
        src: "/journeys/newzealand-2026/photos/05-tekapo-pano.jpg",
        alt: "A panoramic view across Lake Tekapo",
        caption: "Blue hour, before the light left the lake.",
        location: "Lake Tekapo",
        format: "wide",
      },
      {
        src: "/journeys/newzealand-2026/photos/06-tekapo-portrait.jpg",
        alt: "A person photographing the landscape at Lake Tekapo",
        caption: "The observer enters the frame.",
        location: "Lake Tekapo",
        format: "landscape",
      },
      {
        src: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
        alt: "A camera and notebook beside Lake Wanaka",
        caption: "A working pause by the water.",
        location: "Wānaka",
        format: "portrait",
      },
    ],
    closing:
      "The route ended at Aoraki, but the photographs kept returning to the spaces between destinations — the parts of travel that cannot be pinned neatly to a map.",
  },
  {
    slug: "uzbekistan-2026",
    title: "Silk Road, in winter",
    subtitle: "Tashkent, Bukhara, Samarkand",
    description:
      "A field notebook about blue tile, Soviet geometry, old stories, and three cities connected by rail.",
    country: "Uzbekistan",
    countryCode: "UZ",
    dates: "17 — 24 February 2026",
    year: "2026",
    route: ["Tashkent", "Bukhara", "Samarkand"],
    coverImage:
      "https://cdn.ytools.xyz/photos/DSC00614-1771667465746.jpg?imageView2/2/w/3840/q/75|imageslim",
    coverAlt: "Architecture and winter light in Uzbekistan",
    intro:
      "Uzbekistan sits between histories: Chinese traces, Soviet structure, Islamic ornament, and the old movement of people and knowledge along the Silk Road.",
    chapters: [
      {
        number: "01",
        title: "A city below the city",
        place: "Tashkent",
        paragraphs: [
          "Tashkent first revealed itself underground. Every metro station changed its language — marble, mosaics, chandeliers, and the severe confidence of Soviet public architecture.",
          "Above ground, winter made the city feel restrained. The photographs became studies of transition: old facades beside broad avenues, and daily life continuing between them.",
        ],
      },
      {
        number: "02",
        title: "The colour of earth",
        place: "Bukhara",
        paragraphs: [
          "Bukhara was lower, warmer, and more tactile. Mud walls held the late light; courtyards slowed the pace; blue tile appeared as an accent rather than an entire sky.",
          "The city rewarded walking without a destination. Its small thresholds and worn surfaces carried history more convincingly than any single monument.",
        ],
      },
      {
        number: "03",
        title: "Blue that holds its depth",
        place: "Samarkand",
        paragraphs: [
          "At the Registan, scale arrived first. Then detail took over: tile patterns, shadowed doorways, and blues that shifted from turquoise to something almost violet.",
          "The journey ended with the sense that travel does not make history simpler. It lets different centuries remain visible in the same frame.",
        ],
      },
    ],
    frames: [],
    closing:
      "All grandeur is temporary. What remains is the possibility of looking closely enough to leave a small, honest record of having passed through.",
  },
];

export const getJourney = (slug: string) =>
  journeys.find((journey) => journey.slug === slug);
