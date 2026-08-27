"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { JourneyMeta } from "@/modules/journeys/data/journeys";

export type SiteLocale = "en" | "zh-CN";

const STORAGE_KEY = "yueyong-site-locale";

const english = {
  language: {
    label: "Language",
    english: "EN",
    chinese: "中文",
  },
  navigation: {
    label: "Primary navigation",
    home: "Home",
    work: "Work",
    journeys: "Journeys",
    travel: "Travel",
    map: "Map",
    about: "About",
    studio: "Studio",
    menu: "Menu",
    close: "Close",
  },
  shell: {
    brandDetail: "Photography / Field Notes",
    homeLabel: "YueYong Photography home",
    footerTitle: "One archive. Three paths through it.",
    footerDescription:
      "Photography arranged by recurring ideas, lived journeys, and the places that hold them together.",
    role: "Photographer / Software Engineer",
    email: "Email",
  },
  common: {
    archive: "Archive",
    untitled: "Untitled",
    frames: "Frames",
    places: "Places",
    years: "Years",
    country: "Country",
    place: "Place",
    year: "Year",
    notRecorded: "Not recorded",
  },
  home: {
    eyebrow: "Photography by YueYong",
    titleStart: "Photography,",
    titleEnd: "shaped along the way.",
    lede: "Places become the setting. Attention becomes the work — an evolving archive of distance, human traces, and quiet moments in motion.",
    heroAlt: "A solitary figure beside Lake Tekapo",
    heroCaption: "Quiet Distances, No. 04",
    workEyebrow: "01 / Selected Work",
    workTitle: "Recurring ways of seeing.",
    workDescription:
      "A small, edited set of visual questions. Places change; the things I return to remain.",
    workLink: "View selected work",
    workEntries: [
      {
        title: "Quiet Distances",
        description:
          "Scale, weather, and the measured silence between a person and the horizon.",
      },
      {
        title: "Passing Through",
        description:
          "Roads, windows, borrowed viewpoints, and the landscape seen in transit.",
      },
      {
        title: "The Observer",
        description:
          "People looking, making, and becoming part of the scene they came to witness.",
      },
    ],
    journeysEyebrow: "02 / Journeys",
    journeysTitle: "Notes from the road.",
    journeysDescription:
      "Chronology, route, people, and field notes — the longer story around the photographs.",
    journalMeta: "Field journal · 26 April — 02 May 2026",
    journalTitle: "New Zealand 2026",
    travelEyebrow: "03 / Travel",
    travelTitle: "Countries first. Places within.",
    travelDescription:
      "Travel is kept at the scale of a country, while individual cities remain available inside each archive and on the map.",
    travelPrompt: "A broader view of where the work began.",
  },
  work: {
    eyebrow: "01 / Selected Work",
    titleStart: "Recurring ways",
    titleEnd: "of seeing.",
    lede: "Photographs selected for what they notice rather than where they were made — distance, passing time, human traces, and the act of looking.",
    selectedAlt: "Selected photograph",
    fieldStudy: "Field study",
    emptyTitle: "The edit is still in progress.",
    emptyDescription:
      "Photographs marked as favorite in Studio will appear here as the public selection.",
  },
  journeys: {
    eyebrow: "02 / Journeys",
    titleStart: "Stories that need",
    titleEnd: "more than one frame.",
    lede: "Journeys are the longer form of the archive: route, sequence, notes, and photographs kept together as one story. Every entry now lives here, inside the same site.",
    read: "Read the journey",
    readNote: "Read the field note",
    journeyLabel: "Journey",
    fieldNote: "Field note",
    noteFallback: "A field note from the photographic archive.",
    minRead: (minutes: number) => `${minutes} min read`,
  },
  journey: {
    all: "All journeys",
    route: "Route",
    prologue: "Prologue",
    contactSheet: "Contact sheet",
    coda: "Coda",
    browseByPlace: (country: string) => `Browse ${country} by place`,
  },
  travel: {
    eyebrow: "03 / Travel",
    titleStart: "Countries first.",
    titleEnd: "Places within.",
    lede: "Travel is organized at the scale of a country. Open one to find its cities and photographs; use the map when location itself is the way you want to browse.",
    countries: "Countries",
    cities: "Cities",
    cityMap: "City map",
    viewsLabel: "Travel views",
    openCountry: "Open country",
  },
  country: {
    all: "All countries",
    intro: (count: number) =>
      `One country, seen through ${count} ${count === 1 ? "place" : "places"}. Cities remain available as chapters inside this national archive.`,
    cityFrames: (year: string, count: number) => `${year} · ${count} frames`,
    mapLink: "See these cities on the map",
  },
  city: {
    loadingTitle: "Opening the archive.",
    loadingDescription:
      "The photographs and field metadata are being prepared.",
    errorTitle: "This place is temporarily out of reach.",
    errorDescription:
      "The archive could not be loaded. Return to Travel and try again shortly.",
    study: (city: string) =>
      `A photographic place study from ${city}, kept as part of the geographic archive.`,
    photoAlt: (city: string) => `${city} photograph`,
  },
  discover: {
    eyebrow: "04 / Map",
    title: "Cities of the archive.",
    lede: "One point for each city in the public archive. Select a point to see its photographs, or open the city inside its country.",
  },
  map: {
    fallbackTitle: "Live archive temporarily unavailable",
    fallbackDescription:
      "The city index remains visible while the coordinate service reconnects.",
    fallbackLabel: "A quiet city map of the current archive",
    unknownPlace: "Unknown place",
    markerLabel: (city: string, count: number) =>
      `Open ${city}, ${count} photographs`,
    openCity: "Open city ↗",
    photos: "Photos",
    items: "items",
    loadingMap: "Loading map…",
    loading: "Loading...",
    loadMore: "Load more",
    imageError: "Failed to load image",
  },
  photo: {
    loadingTitle: "Preparing the photograph.",
    loadingDescription:
      "The full-resolution frame and its field metadata are loading.",
    errorTitle: "This photograph could not be opened.",
    errorDescription:
      "It may be private, unavailable, or temporarily out of reach.",
    locationUnknown: "Location not recorded",
    back: "Back to the archive",
    photograph: "Photograph",
    fallbackDescription: "A frame from the photographic archive.",
    camera: "Camera",
    lens: "Lens",
    focalLength: "Focal length",
    aperture: "Aperture",
    exposure: "Exposure",
    sensitivity: "Sensitivity",
    date: "Date",
  },
  about: {
    eyebrow: "05 / About",
    title: "A life observed through photographs.",
    paragraphOne:
      "I’m YueYong, a photographer and software engineer. I make images while moving through cities, roads, and open landscapes — looking for the quiet structures that connect a place to the people inside it.",
    paragraphTwo:
      "Travel gives the work its circumstances, but attention gives it its subject: distance, weather, memory, and the small human gestures that make a scene feel lived in.",
    practice: "Practice",
    practiceDescription:
      "Candid moments, road studies, and landscapes shaped into recurring photographic ideas rather than separated only by destination.",
    tools: "Tools",
    contact: "Contact",
    portraitAlt:
      "YueYong standing in front of the University of Sydney Quadrangle",
    xiaohongshu: "Xiaohongshu",
  },
};

const chinese = {
  language: {
    label: "语言",
    english: "EN",
    chinese: "中文",
  },
  navigation: {
    label: "主导航",
    home: "首页",
    work: "精选",
    journeys: "旅程",
    travel: "足迹",
    map: "地图",
    about: "关于",
    studio: "工作台",
    menu: "菜单",
    close: "关闭",
  },
  shell: {
    brandDetail: "摄影 / 旅行手记",
    homeLabel: "YueYong 摄影首页",
    footerTitle: "照片按主题放，旅程按时间写。",
    footerDescription:
      "这里收着我在路上拍的照片，也记下它们来自哪里、那天发生了什么。",
    role: "摄影师 / 软件工程师",
    email: "邮箱",
  },
  common: {
    archive: "档案",
    untitled: "无题",
    frames: "影像",
    places: "地点",
    years: "年份",
    country: "国家",
    place: "地点",
    year: "年份",
    notRecorded: "未记录",
  },
  home: {
    eyebrow: "YueYong 的照片",
    titleStart: "这些照片，",
    titleEnd: "大多是在路上拍的。",
    lede: "我拍城市，也拍路上遇见的人和风景。有些照片来自计划好的行程，更多时候，只是因为当时忍不住停了下来。",
    heroAlt: "蒂卡普湖边的独行者",
    heroCaption: "蒂卡普湖边 · 04",
    workEyebrow: "01 / 精选作品",
    workTitle: "我最想留下的照片。",
    workDescription:
      "这里不按国家或年份分类，只放我自己反复看过、最后仍然喜欢的照片。",
    workLink: "查看精选作品",
    workEntries: [
      {
        title: "湖边",
        description: "风很大，人站在湖岸上，远得只剩一个小小的轮廓。",
      },
      {
        title: "在路上",
        description: "隔着车窗、站在路肩，或者在临时停下来的几分钟里拍。",
      },
      {
        title: "正在看的人",
        description: "有时我拍风景，有时我更想拍那个正在看风景的人。",
      },
    ],
    journeysEyebrow: "02 / 旅程",
    journeysTitle: "照片之外，还有路上的事。",
    journeysDescription:
      "去了哪里，怎么走，和谁同行。单张照片装不下的，我写在旅程里。",
    journalMeta: "旅途手记 · 2026 年 4 月 26 日 — 5 月 2 日",
    journalTitle: "新西兰 · 2026",
    travelEyebrow: "03 / 足迹",
    travelTitle: "按去过的地方找照片。",
    travelDescription:
      "先选国家，再看城市。想直接从地图上找，也可以。",
    travelPrompt: "这些年带着相机去过的地方。",
  },
  work: {
    eyebrow: "01 / 精选作品",
    titleStart: "这些是我",
    titleEnd: "认真挑过的照片。",
    lede: "它们来自不同的地方和年份。共同点只有一个：拍完很久以后，我还愿意回来再看。",
    selectedAlt: "精选摄影作品",
    fieldStudy: "地点未记",
    emptyTitle: "还没有选好。",
    emptyDescription:
      "在 Studio 里把照片标为 favorite 后，它就会出现在这里。",
  },
  journeys: {
    eyebrow: "02 / 旅程",
    titleStart: "一趟路，",
    titleEnd: "不只一张照片。",
    lede: "这里放完整的旅行记录：路线、照片，还有当时随手写下来的事。短一点的笔记也一起收在这里。",
    read: "打开这段旅程",
    readNote: "读这篇手记",
    journeyLabel: "旅行记录",
    fieldNote: "路上随记",
    noteFallback: "一篇还没写摘要的旅行笔记。",
    minRead: (minutes: number) => `大约 ${minutes} 分钟`,
  },
  journey: {
    all: "返回旅程",
    route: "路线",
    prologue: "开头",
    contactSheet: "更多照片",
    coda: "最后",
    browseByPlace: (country: string) => `继续看${country}的照片`,
  },
  travel: {
    eyebrow: "03 / 足迹",
    titleStart: "去过哪里，",
    titleEnd: "照片就放在哪里。",
    lede: "照片按国家和城市整理。要是记不清名字，也可以直接去地图上找。",
    countries: "国家",
    cities: "城市",
    cityMap: "城市地图",
    viewsLabel: "浏览方式",
    openCountry: "查看照片",
  },
  country: {
    all: "全部国家",
    intro: (count: number) =>
      `这次一共去了 ${count} 个地方，照片按城市分开放。`,
    cityFrames: (year: string, count: number) => `${year} · ${count} 张`,
    mapLink: "在地图上查看这些城市",
  },
  city: {
    loadingTitle: "照片正在加载。",
    loadingDescription: "稍等一下。",
    errorTitle: "这里暂时打不开。",
    errorDescription: "请返回足迹页面，过一会儿再试。",
    study: (city: string) => `在${city}拍下的照片。`,
    photoAlt: (city: string) => `${city}的照片`,
  },
  discover: {
    eyebrow: "04 / 地图",
    title: "从地图上找照片。",
    lede: "地图上的每个点都是一个去过的城市。点开可以看照片，也可以进入对应的城市页面。",
  },
  map: {
    fallbackTitle: "地图暂时打不开",
    fallbackDescription: "你仍然可以从下面的城市列表找照片。",
    fallbackLabel: "去过的城市地图",
    unknownPlace: "未知地点",
    markerLabel: (city: string, count: number) =>
      `打开${city}，共 ${count} 张照片`,
    openCity: "查看城市 ↗",
    photos: "照片",
    items: "项",
    loadingMap: "地图加载中…",
    loading: "载入中…",
    loadMore: "载入更多",
    imageError: "图片载入失败",
  },
  photo: {
    loadingTitle: "照片正在加载。",
    loadingDescription: "稍等一下。",
    errorTitle: "这张照片暂时无法打开。",
    errorDescription: "它可能还没有公开，也可能只是暂时加载失败。",
    locationUnknown: "未记录拍摄地点",
    back: "返回照片列表",
    photograph: "照片",
    fallbackDescription: "这张照片还没有说明。",
    camera: "相机",
    lens: "镜头",
    focalLength: "焦距",
    aperture: "光圈",
    exposure: "快门",
    sensitivity: "感光度",
    date: "日期",
  },
  about: {
    eyebrow: "05 / 关于",
    title: "我叫 YueYong，平时写代码，也拍照。",
    paragraphOne:
      "相机大多是在旅行时带着。城市、路边、山和湖都拍，偶尔也拍同行的人。我不太擅长给照片下定义，只是遇到想记住的画面，就会按下快门。",
    paragraphTwo:
      "做这个网站，是想把照片从硬盘里整理出来。除了成片，也留下拍摄地点、时间和一段路上的记忆。",
    practice: "我拍什么",
    practiceDescription:
      "旅行途中遇见的人、路和风景。大多不摆拍，也没有固定题材。",
    tools: "常用器材",
    contact: "找到我",
    portraitAlt: "站在悉尼大学主楼前的 YueYong",
    xiaohongshu: "小红书",
  },
};

const dictionaries = { en: english, "zh-CN": chinese };

type SiteLocaleContextValue = {
  locale: SiteLocale;
  copy: (typeof dictionaries)[SiteLocale];
  setLocale: (locale: SiteLocale) => void;
};

const SiteLocaleContext = createContext<SiteLocaleContextValue | null>(null);

const isSiteLocale = (value: string | null): value is SiteLocale =>
  value === "en" || value === "zh-CN";

export const SiteLocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<SiteLocale>("en");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    const preferredLocale = navigator.language.toLowerCase().startsWith("zh")
      ? "zh-CN"
      : "en";

    setLocaleState(isSiteLocale(savedLocale) ? savedLocale : preferredLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: SiteLocale) => {
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    startTransition(() => setLocaleState(nextLocale));
  };

  const value = useMemo(
    () => ({ locale, copy: dictionaries[locale], setLocale }),
    [locale],
  );

  return (
    <SiteLocaleContext.Provider value={value}>
      {children}
    </SiteLocaleContext.Provider>
  );
};

export const useSiteLocale = () => {
  const context = useContext(SiteLocaleContext);
  if (!context) {
    throw new Error("useSiteLocale must be used inside SiteLocaleProvider");
  }
  return context;
};

const countryNames: Record<string, string> = {
  AU: "澳大利亚",
  CA: "加拿大",
  CN: "中国",
  DE: "德国",
  ES: "西班牙",
  FR: "法国",
  GB: "英国",
  IT: "意大利",
  JP: "日本",
  KR: "韩国",
  NZ: "新西兰",
  SG: "新加坡",
  TH: "泰国",
  TW: "中国台湾",
  US: "美国",
  UZ: "乌兹别克斯坦",
};

const placeNames: Record<string, string> = {
  "Aoraki / Mount Cook": "奥拉基 / 库克山",
  Aoraki: "奥拉基",
  Bukhara: "布哈拉",
  Glenorchy: "格林诺奇",
  "Lake Tekapo": "蒂卡普湖",
  "Lindis Pass": "林迪斯山口",
  Queenstown: "皇后镇",
  Samarkand: "撒马尔罕",
  Sydney: "悉尼",
  Tashkent: "塔什干",
  Tekapo: "蒂卡普",
  Wānaka: "瓦纳卡",
  Wanaka: "瓦纳卡",
};

export const localizeCountryName = (
  name: string,
  code: string | null | undefined,
  locale: SiteLocale,
) =>
  locale === "zh-CN" && code
    ? (countryNames[code.toUpperCase()] ?? name)
    : name;

export const localizePlaceName = (name: string, locale: SiteLocale) =>
  locale === "zh-CN" ? (placeNames[name] ?? name) : name;

type JourneyTranslation = Pick<
  JourneyMeta,
  | "title"
  | "subtitle"
  | "description"
  | "country"
  | "dates"
  | "route"
  | "coverAlt"
  | "intro"
  | "chapters"
  | "frames"
  | "closing"
>;

const journeyTranslations: Record<string, JourneyTranslation> = {
  "newzealand-2026": {
    title: "南岛",
    subtitle: "南阿尔卑斯山下的七天",
    description:
      "2026 年秋天，从皇后镇一路开到奥拉基。七天，几段很长的公路，还有反复变化的天气。",
    country: "新西兰",
    dates: "2026 年 4 月 26 日 — 5 月 2 日",
    route: ["皇后镇", "格林诺奇", "瓦纳卡", "蒂卡普", "奥拉基"],
    coverAlt: "通往奥拉基 / 库克山的公路",
    intro:
      "这趟南岛行程只有七天。每天开车、停车、再上路。真正记住的往往不是景点本身，而是临时靠边的那几分钟：风突然停了，云刚好散开，或者有人走进了画面。",
    chapters: [
      {
        number: "01",
        title: "先上路",
        place: "林迪斯山口",
        paragraphs: [
          "从皇后镇往北开，城镇很快就被甩在身后。林迪斯山口的路很长，车窗外几乎没有建筑，只有起伏的山和不断往前延伸的白线。",
          "那天停了好几次。没有特别的目的，只是觉得眼前这段路值得拍下来。",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/03-lindis-road.jpg",
          alt: "穿过林迪斯山口开阔地貌的公路",
          caption: "林迪斯山口，临时靠边拍的一张。",
          location: "林迪斯山口",
          format: "wide",
        },
      },
      {
        number: "02",
        title: "格林诺奇的傍晚",
        place: "格林诺奇",
        paragraphs: [
          "到格林诺奇时已经接近傍晚。山离得很近，站在路边抬头看，和平时在照片里见到的完全不一样。",
          "我等了一会儿，直到最后一点光落在山脊上。画面里有人，反而更能看出这里有多大。",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/04-glenorchy-peak.jpg",
          alt: "格林诺奇山峰上的光",
          caption: "太阳落下前，山顶还亮着。",
          location: "格林诺奇",
        },
      },
      {
        number: "03",
        title: "蒂卡普的风",
        place: "蒂卡普湖",
        paragraphs: [
          "蒂卡普的湖水确实很蓝，但那天最明显的感受其实是风。岸边的人站不久，说话也听不太清。",
          "我退得很远拍了这张。后来再看，喜欢的不是湖有多漂亮，而是画面里那个人显得很小。",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
          alt: "蒂卡普湖岸边的独行者",
          caption: "湖边风很大，他一个人站了一会儿。",
          location: "蒂卡普湖",
          format: "portrait",
        },
      },
    ],
    frames: [
      {
        src: "/journeys/newzealand-2026/photos/05-tekapo-pano.jpg",
        alt: "蒂卡普湖全景",
        caption: "天快黑时的蒂卡普湖。",
        location: "蒂卡普湖",
        format: "wide",
      },
      {
        src: "/journeys/newzealand-2026/photos/06-tekapo-portrait.jpg",
        alt: "在蒂卡普湖拍摄风景的人",
        caption: "大家都在拍湖，我拍了拍照的人。",
        location: "蒂卡普湖",
        format: "portrait",
      },
      {
        src: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
        alt: "瓦纳卡湖边的相机与笔记本",
        caption: "在瓦纳卡湖边歇一会儿。",
        location: "瓦纳卡",
        format: "landscape",
      },
    ],
    closing:
      "最后一天到了奥拉基，这趟路也就走完了。回来看照片时，我留下最多的却是途中那些临时停车的地方。它们在地图上可能没有名字，但我还记得当时的风和光。",
  },
  "uzbekistan-2026": {
    title: "冬日丝路",
    subtitle: "塔什干、布哈拉、撒马尔罕",
    description:
      "2026 年冬天，坐火车走过塔什干、布哈拉和撒马尔罕。蓝色瓷砖很多，冷风也很实在。",
    country: "乌兹别克斯坦",
    dates: "2026 年 2 月 17 日 — 24 日",
    route: ["塔什干", "布哈拉", "撒马尔罕"],
    coverAlt: "乌兹别克斯坦的建筑与冬日光线",
    intro:
      "这是我第一次去乌兹别克斯坦。八天里走了三座城，城市之间坐火车。出发前想到的是丝绸之路，真正到了以后，记住的却是地铁、街道、泥墙和冬天很早就暗下来的天。",
    chapters: [
      {
        number: "01",
        title: "先从地铁开始",
        place: "塔什干",
        paragraphs: [
          "塔什干给我的第一个惊喜在地下。地铁站一站一个样：有的铺满大理石，有的挂着吊灯，坐几站就像换了一栋建筑。",
          "地面上是宽阔的马路和冬天的灰色。苏联时期的建筑还在，旁边的商店和行人照常过日子。",
        ],
      },
      {
        number: "02",
        title: "在布哈拉慢下来",
        place: "布哈拉",
        paragraphs: [
          "布哈拉和塔什干很不一样。房子更低，街也更窄，傍晚的光落在土墙上，颜色很暖。",
          "这里不太需要赶景点。沿着小路走，看看门、墙和院子，半天很快就过去了。",
        ],
      },
      {
        number: "03",
        title: "撒马尔罕的蓝",
        place: "撒马尔罕",
        paragraphs: [
          "雷吉斯坦比照片里大得多。站近以后反而顾不上看全景，注意力全在瓷砖的纹样、门洞里的阴影和一层层变化的蓝色上。",
          "旅行到这里快结束了。我没有更懂这段历史，只是终于把书本里的地名，和真实见过的街道、车站、天气连在了一起。",
        ],
      },
    ],
    frames: [],
    closing:
      "八天很短，三座城也只能看个大概。回来以后，我还会想起塔什干的地铁、布哈拉傍晚的土墙，还有撒马尔罕那些怎么拍都拍不完的蓝。",
  },
};

export const localizeJourney = (
  journey: JourneyMeta,
  locale: SiteLocale,
): JourneyMeta => {
  if (locale !== "zh-CN") return journey;
  const translation = journeyTranslations[journey.slug];
  return translation ? { ...journey, ...translation } : journey;
};
