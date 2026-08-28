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
  coverImage: string | null;
  coverAlt: string;
  intro: string;
  chapters: JourneyChapter[];
  frames: JourneyFrame[];
  closing: string;
  draft?: boolean;
};

export const journeys: JourneyMeta[] = [
  {
    slug: "newzealand-2026",
    title: "New Zealand, 2026",
    subtitle: "Road notes from Aotearoa",
    description:
      "A working New Zealand road journal, beginning with the route from Queenstown to Aoraki.",
    country: "New Zealand",
    countryCode: "NZ",
    dates: "26 April — 02 May 2026",
    year: "2026",
    route: ["Queenstown", "Glenorchy", "Wānaka", "Tekapo", "Aoraki"],
    coverImage: "https://cdn.ytools.xyz/photos/IMG_4019-1778341297651.jpg",
    coverAlt:
      "A solitary figure standing beside Lake Tekapo with snow-covered mountains beyond",
    intro:
      "The first edit covers the South Island route from Queenstown to Aoraki. North Island photographs will be added as the wider New Zealand project is organised.",
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
  {
    slug: "norway-2025",
    title: "Norway, 2025",
    subtitle: "Flam / Geiranger / Lofoten",
    description:
      "A working edit from the western fjords and the road north to Lofoten.",
    country: "Norway",
    countryCode: "NO",
    dates: "18 — 27 November 2025",
    year: "2025",
    route: ["Flam", "Geiranger", "Lofoten"],
    coverImage:
      "https://images.pexels.com/photos/28010247/pexels-photo-28010247/free-photo-of-nyksund-1.jpeg?auto=compress&cs=tinysrgb&w=2400",
    coverAlt: "Misty mountains and sea near Nyksund in northern Norway",
    intro:
      "This first edit follows the route north: villages at water level, ferry crossings and the weather between them.",
    chapters: [
      {
        number: "01",
        title: "Water level",
        place: "Flam",
        paragraphs: [
          "Harbour, railway and road photographs are grouped here. The final captions and sequence are still being checked.",
        ],
      },
      {
        number: "02",
        title: "Between ferries",
        place: "Geiranger",
        paragraphs: [
          "This chapter follows the crossings and the short stops between the fjords.",
        ],
      },
      {
        number: "03",
        title: "Red cabins",
        place: "Lofoten",
        paragraphs: [
          "The Lofoten edit begins in the fishing villages, then moves outward to the coast.",
        ],
      },
    ],
    frames: [],
    closing: "Final photographs and field notes will replace this working edit.",
    draft: true,
  },
  {
    slug: "iceland-2025",
    title: "Iceland, 2025",
    subtitle: "Reykjavik / Vik / Snaefellsnes",
    description:
      "A first edit of volcanic ground, roadside weather and the long blue hours around the coast.",
    country: "Iceland",
    countryCode: "IS",
    dates: "03 — 10 October 2025",
    year: "2025",
    route: ["Reykjavik", "Vik", "Snaefellsnes"],
    coverImage:
      "https://cdn.ytools.xyz/photos/a56af6d2ade2f278587b32d922431071-1759831612512.JPG?imageView2/2/w/3840/q/75|imageslim",
    coverAlt: "A photographer in a red jacket in Iceland's volcanic landscape",
    intro:
      "The current sequence is arranged by road and weather. Exact locations and captions are still being added.",
    chapters: [
      {
        number: "01",
        title: "First evening",
        place: "Reykjavik",
        paragraphs: [
          "The opening pages begin at the edge of the city, before the drive south.",
        ],
      },
      {
        number: "02",
        title: "South coast",
        place: "Vik",
        paragraphs: [
          "Black ground, low cloud and brief stops along the coast make up the middle of the edit.",
        ],
      },
      {
        number: "03",
        title: "Weather closing in",
        place: "Snaefellsnes",
        paragraphs: [
          "The final group was made around the peninsula as the weather changed.",
        ],
      },
    ],
    frames: [],
    closing: "Locations, dates and the final sequence are still being checked.",
    draft: true,
  },
  {
    slug: "japan-saga-2025",
    title: "Saga, 2025",
    subtitle: "Arita / Karatsu / Yobuko",
    description:
      "A working contact sheet from Saga: ceramic towns, harbour roads and the quieter edge of Kyushu.",
    country: "Japan",
    countryCode: "JP",
    dates: "10 — 20 July 2025",
    year: "2025",
    route: ["Arita", "Karatsu", "Yobuko"],
    coverImage:
      "https://cdn.ytools.xyz/photos/IMG_5103-1758261902190.JPG?imageView2/2/w/3840/q/75|imageslim",
    coverAlt: "A ceramic torii gate and shrine architecture in Saga, Japan",
    intro:
      "The edit starts in Arita and moves north toward the coast. Place names and captions are provisional.",
    chapters: [
      {
        number: "01",
        title: "Porcelain town",
        place: "Arita",
        paragraphs: [
          "Kilns, shopfronts and ceramic details form the first group of photographs.",
        ],
      },
      {
        number: "02",
        title: "Road to the coast",
        place: "Karatsu",
        paragraphs: [
          "The second group leaves the town centre and follows the road toward the sea.",
        ],
      },
      {
        number: "03",
        title: "Harbour",
        place: "Yobuko",
        paragraphs: [
          "Boats, market streets and early-morning harbour frames close the draft.",
        ],
      },
    ],
    frames: [],
    closing: "The photographs are here; the final order and notes are not yet fixed.",
    draft: true,
  },
  {
    slug: "london-2024",
    title: "London, 2024",
    subtitle: "Hyde Park Corner / Soho / The City",
    description:
      "A first London edit, beginning with buses, black cabs and the pace of the street.",
    country: "United Kingdom",
    countryCode: "GB",
    dates: "2024",
    year: "2024",
    route: ["Hyde Park Corner", "Soho", "The City"],
    coverImage:
      "https://images.pexels.com/photos/31483738/pexels-photo-31483738/free-photo-of-busy-london-street-with-iconic-red-buses.jpeg?auto=compress&cs=tinysrgb&w=2400",
    coverAlt:
      "Red double-decker buses moving through Hyde Park Corner in London",
    intro:
      "The first sequence stays at street level. It follows the traffic from Hyde Park Corner into Soho, then ends among the stone facades and glass offices of the City.",
    chapters: [
      {
        number: "01",
        title: "At street level",
        place: "Hyde Park Corner",
        paragraphs: [
          "The opening group stays close to the road: buses pulling away from the kerb, cyclists waiting at the lights and people crossing between lanes.",
          "The red buses locate the city immediately. The photographs concentrate on the smaller intervals around them, where people and traffic briefly share the same frame.",
        ],
      },
      {
        number: "02",
        title: "After the theatres",
        place: "Soho",
        paragraphs: [
          "The streets narrow around Soho. Shopfronts, theatre signs and evening queues replace the wide junctions of the opening pages.",
          "This part moves at walking pace, with the camera closer to faces and to the details that sit at the edge of the street.",
        ],
      },
      {
        number: "03",
        title: "Stone and glass",
        place: "The City",
        paragraphs: [
          "The final group shifts east. Older stone buildings hold their place beside newer glass, while commuters pass through the space between them.",
          "These photographs are quieter and more structural. Repeated windows, dark coats and road markings give the sequence its rhythm.",
        ],
      },
    ],
    frames: [],
    closing:
      "The London edit currently ends in the City. More photographs can be added without changing the three-part structure.",
  },
];

export const getJourney = (slug: string) =>
  journeys.find((journey) => journey.slug === slug);
