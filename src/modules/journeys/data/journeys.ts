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
    subtitle: "Seven stops across the South Island",
    description:
      "Autumn roads, lake towns and the long approach to Aoraki across New Zealand's South Island.",
    country: "New Zealand",
    countryCode: "NZ",
    dates: "25 April — 02 May 2026",
    year: "2026",
    route: [
      "Glenorchy",
      "Paradise",
      "Arrowtown",
      "Wānaka",
      "Twizel",
      "Aoraki",
      "Lake Tekapo",
    ],
    coverImage: "https://cdn.ytools.xyz/photos/IMG_4019-1778341297651.jpg",
    coverAlt:
      "A lone person beside Lake Tekapo with mountains across the water",
    intro:
      "Eight days on the South Island traced a loose arc from the head of Lake Wakatipu to the Mackenzie Basin. Autumn colour gradually gave way to open tussock, glacier valleys and the clear blue of Tekapo.",
    chapters: [
      {
        number: "01",
        title: "The road reaches the lake",
        place: "Glenorchy",
        paragraphs: [
          "Glenorchy sits where the road runs out at the northern end of Lake Wakatipu. A small cabin below the ridge fixes the scale of the first photographs; the mountains occupy almost everything else.",
          "This is where the journey settles into its pace. The frame stays low and quiet, close to the few signs of habitation at the foot of the range.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC01057-1778306568601.JPG",
          alt: "A small cabin beneath autumn mountains near Glenorchy",
          caption: "A cabin at the foot of the range.",
          location: "Glenorchy",
          format: "landscape",
        },
      },
      {
        number: "02",
        title: "Beyond the last town",
        place: "Paradise",
        paragraphs: [
          "Past Glenorchy, the road narrows and the named places become sparse. At Paradise, still water and a snow-lined horizon fill the view, with the track following the edge of the lake.",
          "The photographs alternate between the broad landscape and smaller interruptions: a bend in the road, a stand of trees, a single cloud resting on the ridge.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DJI_20260427094951_0242_D-1778337584111.jpg",
          alt: "A road curving beside a mountain lake near Paradise",
          caption: "The road beyond Glenorchy.",
          location: "Paradise",
          format: "wide",
        },
      },
      {
        number: "03",
        title: "Autumn gives directions",
        place: "Arrowtown",
        paragraphs: [
          "Arrowtown arrives in copper and yellow. Old lanes, low roofs and signposts are half-covered by trees at the end of the season.",
          "The most useful photograph is also the simplest: three street names beneath a canopy of leaves, pointing back towards Queenstown and deeper into town.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC01144-1778338054799.jpg",
          alt: "Street signs beneath autumn foliage in Arrowtown",
          caption: "Three directions under the autumn canopy.",
          location: "Arrowtown",
          format: "wide",
        },
      },
      {
        number: "04",
        title: "A pause by the water",
        place: "Wānaka",
        paragraphs: [
          "Wānaka is recorded at walking pace. People cross the pale shore beneath yellow trees while the mountains stay soft on the far side of the lake.",
          "A camera and an open laptop on the grass turn one stop into a small working table. The journey continues, but the edit begins here.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/AD1E4330-6FA1-47D0-8E29-9DE3A6F37571-1778337522458.JPG",
          alt: "A camera and laptop on the grass beside Lake Wānaka",
          caption: "A temporary desk beside the lake.",
          location: "Wānaka",
          format: "portrait",
        },
      },
      {
        number: "05",
        title: "The landscape enters the room",
        place: "Twizel",
        paragraphs: [
          "Near Twizel, a wide window turns the lake and mountains into a framed view. The empty bench below it is the only furniture the photograph needs.",
          "After several days spent looking through windscreens and camera viewfinders, the scene offers a different kind of pause: the road is outside, already waiting.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_3839-1778341867883.jpg",
          alt: "A bench facing a large window overlooking water and mountains near Twizel",
          caption: "The Mackenzie landscape, seen from indoors.",
          location: "Twizel",
          format: "portrait",
        },
      },
      {
        number: "06",
        title: "Following the glacial water",
        place: "Aoraki",
        paragraphs: [
          "The approach to Aoraki follows braided water into a steep valley. Rock, ice and cloud divide the frame into rough bands, each one carrying a different version of the same cold light.",
          "A vertical photograph lets the river lead from the foreground towards the snow. The mountain remains distant, even after the road has brought it close.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/img_20260430_022-1778341421420.jpg",
          alt: "A glacial river leading towards snowy mountains at Aoraki",
          caption: "Glacial water on the approach to Aoraki.",
          location: "Aoraki / Mount Cook",
          format: "portrait",
        },
      },
      {
        number: "07",
        title: "Blue, with room around it",
        place: "Lake Tekapo",
        paragraphs: [
          "At Tekapo, colour does most of the work. Blue water, pale grass and snow hold their own areas of the frame, while a person on the shore becomes a small dark mark.",
          "The final photographs step back from the lake to include the town and the road out. The route finishes with distance returning to the picture.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/Rec709Fix_img_20260501_017-1778341246788.jpg",
          alt: "A person standing among golden grass beside Lake Tekapo",
          caption: "A figure at the edge of the lake.",
          location: "Lake Tekapo",
          format: "portrait",
        },
      },
    ],
    frames: [
      {
        src: "https://cdn.ytools.xyz/photos/DSC01089-1778306537777.JPG",
        alt: "Still water and snow-covered mountains near Paradise",
        caption: "Still water beyond Glenorchy.",
        location: "Paradise",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC01135-1778338004090.jpg",
        alt: "Arrowtown among colourful autumn trees",
        caption: "The town beneath its autumn colour.",
        location: "Arrowtown",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC01190-1778338163399.jpg",
        alt: "People walking along the shore of Lake Wānaka",
        caption: "An afternoon along the shore.",
        location: "Wānaka",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_4100-1778340939102.jpg",
        alt: "Lake Tekapo township below mountains and autumn trees",
        caption: "The lake seen from above the township.",
        location: "Lake Tekapo",
        format: "wide",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_4874-1778340842818.jpg",
        alt: "A car stopped beside a winding road in the Waitaki District",
        caption: "One last roadside stop.",
        location: "Waitaki District",
        format: "wide",
      },
    ],
    closing:
      "The South Island sequence ends on another road, with the mountains receding in the mirror and the next bend still out of sight.",
  },
  {
    slug: "uzbekistan-2026",
    title: "Silk Road, in winter",
    subtitle: "Tashkent / Bukhara / Samarkand",
    description:
      "Three cities connected by rail, seen through underground halls, earthen streets and blue-tiled monuments.",
    country: "Uzbekistan",
    countryCode: "UZ",
    dates: "10 — 18 February 2026",
    year: "2026",
    route: ["Tashkent", "Bukhara", "Samarkand"],
    coverImage:
      "https://cdn.ytools.xyz/photos/DSC00614-1771667465746.jpg",
    coverAlt: "Gold and blue ornament inside a historic building in Samarkand",
    intro:
      "The railway gives this journey its line. Tashkent, Bukhara and Samarkand follow one another through a winter week, while the photographs move from public interiors to old courtyards and, finally, the decorated surfaces of Samarkand.",
    chapters: [
      {
        number: "01",
        title: "A city below the city",
        place: "Tashkent",
        paragraphs: [
          "Tashkent first appears underground. Long station halls, polished floors and patterned walls give each platform its own formal language.",
          "Commuters pass through the symmetry without ceremony. Their ordinary movement keeps the architecture from becoming a museum piece.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC00347-1771665184586.jpg",
          alt: "Passengers walking through a patterned metro hall in Tashkent",
          caption: "The daily route through a ceremonial interior.",
          location: "Tashkent",
          format: "landscape",
        },
      },
      {
        number: "02",
        title: "Brick, timber, late light",
        place: "Bukhara",
        paragraphs: [
          "Bukhara lowers the horizon. Brick walls and carved timber fill the photographs, their surfaces carrying the marks of repair and use.",
          "A bird on a wooden balcony gives one frame its measure. The city is read through details close enough to touch, rather than through a distant skyline.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC00310-1771665062474.JPG",
          alt: "Sunlit brickwork and a carved wooden column in Bukhara",
          caption: "Late light across brick and carved timber.",
          location: "Bukhara",
          format: "portrait",
        },
      },
      {
        number: "03",
        title: "Blue keeps changing",
        place: "Samarkand",
        paragraphs: [
          "Samarkand is built from repeated approaches. An arch opens onto a minaret; a passage reveals a blue dome; the same tile shifts colour as the sun moves across it.",
          "Inside, the camera turns upward. Gold geometry and star-like ceilings close the sequence, compressing a monumental city into a circle of ornament.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC00739-1771667556539.jpg",
          alt: "A tiled arch framing a minaret and blue sky in Samarkand",
          caption: "A minaret held inside another arch.",
          location: "Samarkand",
          format: "portrait",
        },
      },
    ],
    frames: [
      {
        src: "https://cdn.ytools.xyz/photos/DSC00400-1771666999812.jpg",
        alt: "A bird perched on a carved wooden balcony in Bukhara",
        caption: "A small resident among the carved wood.",
        location: "Bukhara",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC00505-1771667195230.jpg",
        alt: "People passing through an arch with a blue dome beyond in Samarkand",
        caption: "The city appears one doorway at a time.",
        location: "Samarkand",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC00601-1771667315705.jpg",
        alt: "An older man seated alone on a park bench in Samarkand",
        caption: "Winter sun in a city park.",
        location: "Samarkand",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_1530-1771667599930.JPG",
        alt: "A richly decorated blue and gold ceiling in Samarkand",
        caption: "The final frame looks straight up.",
        location: "Samarkand",
        format: "portrait",
      },
    ],
    closing:
      "The train line ends at Samarkand. The last photographs stay indoors, looking up at ceilings made to resemble an entire sky.",
  },
  {
    slug: "norway-2025",
    title: "Norway, 2025",
    subtitle: "Oslo / Reine",
    description:
      "Two vertical frames from Norway: a wet city street and a fishing village beneath the Lofoten peaks.",
    country: "Norway",
    countryCode: "NO",
    dates: "05 — 06 October 2025",
    year: "2025",
    route: ["Oslo", "Reine"],
    coverImage:
      "https://cdn.ytools.xyz/photos/C9884F12-91DB-41CB-98BC-ED10F7988041-1759828372723.JPG",
    coverAlt: "Red fishing cabins below a steep mountain in Reine, Norway",
    intro:
      "Only two photographs remain in this short Norwegian note. They were made a day apart and far from one another, so the sequence keeps the distance visible.",
    chapters: [
      {
        number: "01",
        title: "Rain at walking pace",
        place: "Oslo",
        paragraphs: [
          "Oslo is held in one wet street. A person with an umbrella crosses the frame while the buildings and pavement recede into grey.",
          "There is no establishing view. The weather, the stride and the narrow portrait crop are enough to place the city at human scale.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_6999-1759831483292.jpg",
          alt: "A pedestrian with an umbrella on a rainy street in Oslo",
          caption: "Oslo reduced to rain and one passing figure.",
          location: "Oslo",
          format: "portrait",
        },
      },
      {
        number: "02",
        title: "Red at the foot of the mountain",
        place: "Reine",
        paragraphs: [
          "In Reine, red fishing cabins gather at the water beneath a mountain that rises almost vertically behind them.",
          "The portrait frame stacks village, rock and cloud. That compression carries the whole Lofoten note in a single photograph.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/C9884F12-91DB-41CB-98BC-ED10F7988041-1759828372723.JPG",
          alt: "Red fishing cabins beneath a steep mountain in Reine",
          caption: "Reine, built between water and rock.",
          location: "Reine",
          format: "portrait",
        },
      },
    ],
    frames: [],
    closing:
      "Two frames cannot describe a country. They can still hold the abrupt change from pavement to open water, and from a low city sky to a mountain filling the page.",
  },
  {
    slug: "iceland-2025",
    title: "Iceland, 2025",
    subtitle: "A seven-day circuit through weather and water",
    description:
      "A route from Reykjavík to the south coast, north to Mývatn and Akureyri, then west beneath the aurora.",
    country: "Iceland",
    countryCode: "IS",
    dates: "28 September — 04 October 2025",
    year: "2025",
    route: [
      "Reykjavík",
      "Selfoss",
      "Hvolsvöllur",
      "Vík",
      "Höfn",
      "Öræfasveit",
      "Kirkjubæjarklaustur",
      "Mývatn",
      "Akureyri",
      "Snæfellsbær",
    ],
    coverImage:
      "https://cdn.ytools.xyz/photos/a56af6d2ade2f278587b32d922431071-1759831612512.JPG",
    coverAlt: "A photographer in a red jacket crossing the volcanic ground at Mývatn",
    intro:
      "The route begins and ends in Reykjavík, but almost every photograph points away from the city. Rain drives across the south, glacial water cuts through black ground, and the final nights are lit by aurora in the north and west.",
    chapters: [
      {
        number: "01",
        title: "Stone against the sky",
        place: "Reykjavík",
        paragraphs: [
          "Hallgrímskirkja is the first vertical in the sequence. Its stepped concrete rises through a white sky while a visitor at the entrance records the same view on a phone.",
          "A week later, the city returns in colour: a descending street, small painted houses and the sea at the end of the road.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_5754-1759832214060.jpg",
          alt: "A visitor photographing Hallgrímskirkja beneath a cloudy sky",
          caption: "The journey begins with the camera pointed up.",
          location: "Reykjavík",
          format: "portrait",
        },
      },
      {
        number: "02",
        title: "The first wall of water",
        place: "Selfoss",
        paragraphs: [
          "The first day south is recorded through spray. A waterfall drops behind a veil of mist, filling the portrait frame from top to bottom.",
          "Road, sky and horizon disappear at the edge of the water. The route has left the city, and weather has taken over the composition.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_5955-1759831190458.JPG",
          alt: "A large waterfall partly hidden by spray near Selfoss",
          caption: "The southbound road enters the mist.",
          location: "Selfoss",
          format: "portrait",
        },
      },
      {
        number: "03",
        title: "Standing in the rain",
        place: "Hvolsvöllur",
        paragraphs: [
          "At Hvolsvöllur, a figure faces the rain with both arms open. The gesture is brief and direct, framed by wet ground and a horizon softened by cloud.",
          "The red jacket returns later in the journey. Here it first gives the grey landscape a point of reference.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_6057-1759832420915.jpg",
          alt: "A person in a red jacket standing with open arms in the rain near Hvolsvöllur",
          caption: "Rain crossing the southern plain.",
          location: "Hvolsvöllur",
          format: "portrait",
        },
      },
      {
        number: "04",
        title: "The Atlantic draws the edge",
        place: "Vík",
        paragraphs: [
          "From above Vík, the coast becomes a clean boundary. White water advances across black sand, then pulls back and redraws the line.",
          "The aerial frame removes the usual sense of scale. Wave, beach and dark sea repeat until the landscape looks almost graphic.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DJI_20250930000950_0097_D-1759832345081.jpeg",
          alt: "Atlantic waves meeting a black-sand coast near Vík from above",
          caption: "The coast redrawn with every wave.",
          location: "Vík í Mýrdal",
          format: "wide",
        },
      },
      {
        number: "05",
        title: "Ice reaches the sea",
        place: "Höfn",
        paragraphs: [
          "Near Höfn, one clear piece of ice rests on black sand. Its edges catch what little light remains, separated from the glacier that shaped it.",
          "The frame stays close. A whole glacial landscape is reduced to one temporary object at the reach of the tide.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC07134-1759831743468.jpg",
          alt: "A clear piece of glacier ice resting on black sand near Höfn",
          caption: "Glacial ice at the edge of the Atlantic.",
          location: "Höfn",
          format: "portrait",
        },
      },
      {
        number: "06",
        title: "Reading the glacier from above",
        place: "Öræfasveit",
        paragraphs: [
          "Over Öræfasveit, the glacier is a surface of folds and dark seams. Meltwater gathers along its edge and carries the same lines into the valley.",
          "The narrow aerial photographs follow those marks vertically. Ice, sediment and water share one channel through the frame.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DJI_20251001000907_0051_D-1759831287548.jpg",
          alt: "Aerial view of a folded glacier in Öræfasveit",
          caption: "Lines of ice seen from above.",
          location: "Öræfasveit",
          format: "portrait",
        },
      },
      {
        number: "07",
        title: "A river occupies the valley",
        place: "Kirkjubæjarklaustur",
        paragraphs: [
          "At Kirkjubæjarklaustur, the drone follows a river through steep green ground. Water divides and rejoins around rock before dropping out of sight.",
          "Three adjacent frames turn the valley into a short study of direction. The camera stays high while the river supplies the movement.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DJI_20250930204538_0133_D-1759830450256.JPG",
          alt: "A river and waterfall winding through a green valley near Kirkjubæjarklaustur",
          caption: "The river sets the direction of the frame.",
          location: "Kirkjubæjarklaustur",
          format: "portrait",
        },
      },
      {
        number: "08",
        title: "Red on volcanic ground",
        place: "Mývatn",
        paragraphs: [
          "At Mývatn, the landscape opens into dark volcanic ground and distant low mountains. A photographer in a red jacket crosses the middle of it with a tripod.",
          "The human figure gives the terrain its scale. It also turns the act of making the photograph into part of the photograph itself.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/a56af6d2ade2f278587b32d922431071-1759831612512.JPG",
          alt: "A photographer in a red jacket carrying a tripod across Mývatn",
          caption: "Crossing the volcanic plain with a tripod.",
          location: "Mývatn",
          format: "landscape",
        },
      },
      {
        number: "09",
        title: "Green above the autumn road",
        place: "Akureyri",
        paragraphs: [
          "The road into Akureyri is lined with yellow leaves, a brief band of ordinary autumn between days of bare ground and ice.",
          "After dark, the colour moves overhead. Two exposures record the aurora stretching across a nearly empty sky.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC07789-1759832512160.JPG",
          alt: "Green aurora moving across the night sky near Akureyri",
          caption: "The sky after the autumn road went dark.",
          location: "Akureyri",
          format: "landscape",
        },
      },
      {
        number: "10",
        title: "One last vertical light",
        place: "Snæfellsbær",
        paragraphs: [
          "The final night photograph is made in Snæfellsbær. A vertical band of aurora rises above a dark foreground, with almost no other detail asking for attention.",
          "By morning the route turns back to Reykjavík. The week closes where it began, though the last landscape in the sequence belongs entirely to the night.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_6808-1759832638518.jpg",
          alt: "A vertical band of green aurora above Snæfellsbær",
          caption: "The last night on the western peninsula.",
          location: "Snæfellsbær",
          format: "portrait",
        },
      },
    ],
    frames: [
      {
        src: "https://cdn.ytools.xyz/photos/DJI_20251001000916_0053_D-1759831361161.jpg",
        alt: "Glacial meltwater cutting through dark sediment in Öræfasveit",
        caption: "Meltwater at the glacier's edge.",
        location: "Öræfasveit",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DJI_20250930204439_0131_D-1759830272179.JPG",
        alt: "A bright river running between green slopes near Kirkjubæjarklaustur",
        caption: "Water through the green valley.",
        location: "Kirkjubæjarklaustur",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_6652-1759831950721.jpg",
        alt: "A road lined with yellow autumn trees in Akureyri",
        caption: "A short return to autumn colour.",
        location: "Akureyri",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_6843-1759832031102.jpg",
        alt: "A Reykjavík street descending between colourful houses towards the sea",
        caption: "Back in Reykjavík, with the sea at the end of the street.",
        location: "Reykjavík",
        format: "portrait",
      },
    ],
    closing:
      "The circuit returns to Reykjavík after seven days. Water is present in nearly every frame, falling, freezing, breaking on the coast or carrying a reflection of the night sky.",
  },
  {
    slug: "japan-saga-2025",
    title: "Saga, 2025",
    subtitle: "Takeo / Saga City / Arita",
    description:
      "A two-day note from Saga Prefecture, moving between railway lines, a riverside lane and Arita's ceramic town.",
    country: "Japan",
    countryCode: "JP",
    dates: "12 — 13 September 2025",
    year: "2025",
    route: ["Takeo", "Saga City", "Arita"],
    coverImage:
      "https://cdn.ytools.xyz/photos/DSC06738-1758261757210.JPG",
    coverAlt: "A warmly lit room filled with old objects in Saga, Japan",
    intro:
      "This short sequence crosses Saga Prefecture from Takeo to Saga City and Arita. Railway lines, a quiet riverside lane and ceramic details give each stop a different pace.",
    chapters: [
      {
        number: "01",
        title: "Railway lines and books",
        place: "Takeo",
        paragraphs: [
          "The first photographs face the tracks. Rails run through the frame in parallel while the white body of a train cuts across them.",
          "Takeo returns later through a room lined with books. Public transport and a reading table give the city two quiet forms of shared space.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_4675-1758261846245.jpeg",
          alt: "A white train passing railway tracks in Takeo",
          caption: "The first movement through Saga Prefecture.",
          location: "Takeo",
          format: "portrait",
        },
      },
      {
        number: "02",
        title: "One lane beside the river",
        place: "Saga City",
        paragraphs: [
          "Saga City is represented by a single narrow lane near the river. Walls, poles and an empty strip of road lead the eye through the portrait frame.",
          "It is a modest interruption between two larger groups of photographs, kept because an ordinary street can locate a journey as clearly as a landmark.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_4678-1758261875943.JPG",
          alt: "A quiet narrow lane near the river in Saga City",
          caption: "An ordinary street between destinations.",
          location: "Saga City",
          format: "portrait",
        },
      },
      {
        number: "03",
        title: "Ceramic town",
        place: "Arita",
        paragraphs: [
          "Arita is the largest group in the sequence. A ceramic torii, tiled details, dense green lanes and an old room appear within a few streets of one another.",
          "The photographs move between fired surfaces and living foliage. Warm indoor light closes the group, while a still reflection provides its final frame.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC06738-1758261757210.JPG",
          alt: "A warmly lit room with wooden shelves and collected objects in Arita",
          caption: "A quiet room in the ceramic town.",
          location: "Arita",
          format: "landscape",
        },
      },
    ],
    frames: [
      {
        src: "https://cdn.ytools.xyz/photos/IMG_4674-1758261812809.JPG",
        alt: "Railway tracks stretching away in Takeo",
        caption: "Parallel lines at the station.",
        location: "Takeo",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_5112-1758262116373.JPG",
        alt: "Books arranged on wooden shelves in Takeo",
        caption: "A reading room later in the day.",
        location: "Takeo",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_5103-1758261902190.JPG",
        alt: "A ceramic torii and shrine structures among green hills in Arita",
        caption: "A ceramic gate above the town.",
        location: "Arita",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_5107-1758261928856.JPG",
        alt: "A green corner along a lane in Arita",
        caption: "Green closes around the lane.",
        location: "Arita",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/IMG_5114-1757991996858.JPG",
        alt: "A still reflection in Arita",
        caption: "A final, still surface.",
        location: "Arita",
        format: "landscape",
      },
    ],
    closing:
      "Saga remains a compact note. Two days connect Takeo's tracks and books, one lane in Saga City and the ceramic surfaces of Arita.",
  },
  {
    slug: "london-2024",
    title: "United Kingdom, 2024",
    subtitle: "London / Dover / Edinburgh / Cambridge / Oxford",
    description:
      "Eight days from London's wet streets to the coast, then north and back through two university cities.",
    country: "United Kingdom",
    countryCode: "GB",
    dates: "27 April — 04 May 2024",
    year: "2024",
    route: ["London", "Dover", "Edinburgh", "Cambridge", "Oxford"],
    coverImage:
      "https://cdn.ytools.xyz/photos/DSC07021-1752421603428.JPG",
    coverAlt: "An illuminated footbridge crossing the Thames in London at night",
    intro:
      "The route begins in London rain, reaches the Channel at Dover and continues north to Edinburgh before returning through Cambridge and Oxford. Trains connect the cities; stone, wet streets and brief openings of green connect the photographs.",
    chapters: [
      {
        number: "01",
        title: "Platforms, rain, river light",
        place: "London",
        paragraphs: [
          "London begins on a station platform at night. The next frames follow umbrellas through wet streets, then arrive at the Thames after the lamps have come on.",
          "The city is held together by movement between those points. Tracks, pavements and bridge cables each draw a different route across the picture.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC07021-1752421603428.JPG",
          alt: "An illuminated footbridge and city lights reflected in the Thames",
          caption: "The river crossing after dark.",
          location: "London",
          format: "landscape",
        },
      },
      {
        number: "02",
        title: "At the edge of the Channel",
        place: "Dover",
        paragraphs: [
          "Dover opens the journey to wind and distance. Two figures stand near the cliff edge facing a blue strip of water that continues to the horizon.",
          "After the close streets of London, the portrait frame contains very little: grass, chalk, sea and two backs turned towards the camera.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_7133 (1)-1752420119679.jpeg",
          alt: "Two people standing on the cliffs at Dover and looking across the sea",
          caption: "Looking out across the Channel.",
          location: "Dover",
          format: "portrait",
        },
      },
      {
        number: "03",
        title: "Stone after rain",
        place: "Edinburgh",
        paragraphs: [
          "Edinburgh appears first at night, with traffic moving over rain-darkened streets between old facades. By day, a road sign and a heavy stone wall replace the reflections.",
          "The two photographs share the same compressed palette. The city supplies its own structure through masonry, road markings and the rise of the street.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_9011-1752421007888.jpeg",
          alt: "Traffic moving along a wet Edinburgh street at night",
          caption: "Night traffic on a rain-darkened street.",
          location: "Edinburgh",
          format: "portrait",
        },
      },
      {
        number: "04",
        title: "Across the meadow",
        place: "Cambridge",
        paragraphs: [
          "Cambridge is seen from across open grass. Gothic stone rises behind the meadow while a small working vehicle crosses the middle distance.",
          "The frame keeps daily maintenance inside the postcard view. Old architecture and present-day work occupy the same quiet morning.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/IMG_9311-1752421322437.jpeg",
          alt: "Gothic college buildings beyond a green meadow in Cambridge",
          caption: "The college skyline beyond the working meadow.",
          location: "Cambridge",
          format: "portrait",
        },
      },
      {
        number: "05",
        title: "Walls and open ground",
        place: "Oxford",
        paragraphs: [
          "Oxford closes the route with two different kinds of weight. Carved stone fills one frame; three large trees stand alone on a green slope in the next.",
          "The final edit leaves both views together. Architecture records accumulated labour, while the open ground gives the journey somewhere to breathe before the return train.",
        ],
        frame: {
          src: "https://cdn.ytools.xyz/photos/DSC08958-1752421423931.JPG",
          alt: "Carved Gothic stonework on an Oxford college building",
          caption: "A wall assembled from detail.",
          location: "Oxford",
          format: "landscape",
        },
      },
    ],
    frames: [
      {
        src: "https://cdn.ytools.xyz/photos/IMG_6276-1752421999783.jpeg",
        alt: "An empty London railway platform lit at night",
        caption: "Waiting for the first train in the sequence.",
        location: "London",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC06634-1752421878006.JPG",
        alt: "Two people sharing an umbrella on a wet London street",
        caption: "Walking through the rain.",
        location: "London",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC07070-1752421780913.JPG",
        alt: "Bridge cables and lights crossing the night sky above London",
        caption: "Lines above the Thames.",
        location: "London",
        format: "portrait",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC08871-1752421146644.jpeg",
        alt: "A road sign beside an old stone wall in Edinburgh",
        caption: "A direction held against the stone.",
        location: "Edinburgh",
        format: "landscape",
      },
      {
        src: "https://cdn.ytools.xyz/photos/DSC09126-1752421504477.JPG",
        alt: "Three large trees standing on a green slope in Oxford",
        caption: "Open ground at the end of the route.",
        location: "Oxford",
        format: "landscape",
      },
    ],
    closing:
      "The last frame holds three trees on an Oxford slope. After a week of platforms, walls and wet streets, the route ends with open ground.",
  },
];

export const getJourney = (slug: string) =>
  journeys.find((journey) => journey.slug === slug);
