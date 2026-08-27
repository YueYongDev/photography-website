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
    brandDetail: "摄影 / 途中手记",
    homeLabel: "YueYong 摄影首页",
    footerTitle: "一座影像档案，三条观看路径。",
    footerDescription:
      "以反复出现的主题、亲历的旅程，以及承载这些记忆的地方，重新整理摄影。",
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
    eyebrow: "YueYong 摄影",
    titleStart: "摄影，",
    titleEnd: "在路上慢慢成形。",
    lede: "地方成为背景，凝视成为创作——这是一座仍在生长的影像档案，关于距离、人的痕迹，以及流动途中安静的瞬间。",
    heroAlt: "蒂卡普湖边的独行者",
    heroCaption: "《安静的距离》· 04",
    workEyebrow: "01 / 精选作品",
    workTitle: "反复回到的观看方式。",
    workDescription:
      "一组克制而精简的视觉提问。地点不断变化，真正吸引我的事物却始终留在原处。",
    workLink: "查看精选作品",
    workEntries: [
      {
        title: "安静的距离",
        description: "尺度、天气，以及人与地平线之间被仔细度量的寂静。",
      },
      {
        title: "经过之间",
        description: "道路、车窗、借来的视点，以及在移动中被看见的风景。",
      },
      {
        title: "观看的人",
        description: "人们凝望、拍摄，也逐渐成为自己前来见证的景色的一部分。",
      },
    ],
    journeysEyebrow: "02 / 旅程",
    journeysTitle: "写在路上的手记。",
    journeysDescription:
      "时间、路线、同行的人与现场笔记——照片之外，那段更完整的故事。",
    journalMeta: "旅途手记 · 2026 年 4 月 26 日 — 5 月 2 日",
    journalTitle: "新西兰 · 2026",
    travelEyebrow: "03 / 足迹",
    travelTitle: "先看国家，再走进地方。",
    travelDescription:
      "足迹以国家为尺度整理，每座城市仍可在各自的档案与地图中被单独打开。",
    travelPrompt: "从更宽的视角，看见这些作品从何处开始。",
  },
  work: {
    eyebrow: "01 / 精选作品",
    titleStart: "反复回到的",
    titleEnd: "观看方式。",
    lede: "这些照片因它们注意到的事物而被选择，而非拍摄地点——距离、流逝的时间、人的痕迹，以及观看本身。",
    selectedAlt: "精选摄影作品",
    fieldStudy: "现场习作",
    emptyTitle: "这组精选仍在编辑中。",
    emptyDescription:
      "在工作台中标记为 favorite 的照片，会作为正式精选展示在这里。",
  },
  journeys: {
    eyebrow: "02 / 旅程",
    titleStart: "有些故事，",
    titleEnd: "需要不止一帧。",
    lede: "旅程是这座档案的长篇形式：路线、次序、文字与照片被保存在同一个故事里。每一段远行，都在这里拥有自己的位置。",
    read: "阅读这段旅程",
    readNote: "阅读途中手记",
    journeyLabel: "旅程",
    fieldNote: "途中手记",
    noteFallback: "摄影档案中的一篇途中手记。",
    minRead: (minutes: number) => `约 ${minutes} 分钟阅读`,
  },
  journey: {
    all: "全部旅程",
    route: "路线",
    prologue: "序章",
    contactSheet: "接触印样",
    coda: "尾声",
    browseByPlace: (country: string) => `按地点浏览${country}`,
  },
  travel: {
    eyebrow: "03 / 足迹",
    titleStart: "先看国家，",
    titleEnd: "再走进地方。",
    lede: "旅行档案以国家为尺度整理。打开一个国家，可以找到其中的城市与照片；如果地点本身就是观看方式，也可以直接使用地图。",
    countries: "国家",
    cities: "城市",
    cityMap: "城市地图",
    viewsLabel: "足迹浏览方式",
    openCountry: "打开国家档案",
  },
  country: {
    all: "全部国家",
    intro: (count: number) =>
      `以一个国家为尺度，从 ${count} 个地点观看。每座城市都是这份国家档案中的独立章节。`,
    cityFrames: (year: string, count: number) => `${year} · ${count} 帧`,
    mapLink: "在地图上查看这些城市",
  },
  city: {
    loadingTitle: "正在打开影像档案。",
    loadingDescription: "照片与现场信息正在准备中。",
    errorTitle: "暂时无法抵达这个地方。",
    errorDescription: "档案未能载入，请返回足迹页面稍后再试。",
    study: (city: string) =>
      `一组来自${city}的地方摄影习作，作为地理档案的一部分被保存。`,
    photoAlt: (city: string) => `${city}摄影作品`,
  },
  discover: {
    eyebrow: "04 / 地图",
    title: "档案里的城市。",
    lede: "公开档案中的每座城市，都在这里拥有一个坐标。选择一个点查看照片，或进入它所属的国家档案。",
  },
  map: {
    fallbackTitle: "实时档案暂时不可用",
    fallbackDescription: "坐标服务重新连接时，城市索引仍会保留在这里。",
    fallbackLabel: "当前摄影档案的城市地图",
    unknownPlace: "未知地点",
    markerLabel: (city: string, count: number) =>
      `打开${city}，共 ${count} 张照片`,
    openCity: "打开城市 ↗",
    photos: "照片",
    items: "项",
    loading: "载入中…",
    loadMore: "载入更多",
    imageError: "图片载入失败",
  },
  photo: {
    loadingTitle: "正在准备这张照片。",
    loadingDescription: "高分辨率影像与现场参数正在载入。",
    errorTitle: "这张照片暂时无法打开。",
    errorDescription: "它可能未公开、已不可用，或暂时无法访问。",
    locationUnknown: "未记录拍摄地点",
    back: "返回影像档案",
    photograph: "摄影作品",
    fallbackDescription: "摄影档案中的一帧。",
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
    title: "用照片，观察经过的人生。",
    paragraphOne:
      "我是 YueYong，一名摄影师与软件工程师。我在城市、道路和开阔的风景之间移动、拍照，寻找那些安静的结构——它们把一个地方与生活其中的人连接起来。",
    paragraphTwo:
      "旅行给作品以契机，注意力则给它真正的主题：距离、天气、记忆，以及让一个场景显得有人生活过的细小动作。",
    practice: "创作",
    practiceDescription:
      "把未经摆布的瞬间、道路习作与风景，整理成反复出现的摄影主题，而不只按照目的地分隔。",
    tools: "器材",
    contact: "联系",
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
      "一册穿过秋日光线、冰川湖水，以及皇后镇与奥拉基之间漫长距离的公路手记。",
    country: "新西兰",
    dates: "2026 年 4 月 26 日 — 5 月 2 日",
    route: ["皇后镇", "格林诺奇", "瓦纳卡", "蒂卡普", "奥拉基"],
    coverAlt: "通往奥拉基 / 库克山的公路",
    intro:
      "南岛并不是一张等待打勾的景点清单。那一周由变幻的天气、路边的停顿，以及熟悉的风景忽然与自己有关的瞬间来计量。",
    chapters: [
      {
        number: "01",
        title: "道路决定节奏",
        place: "林迪斯山口",
        paragraphs: [
          "离开皇后镇，土地比行程表更快地舒展开来。道路成为旅途的连接组织：漫长、浅淡的线条，让距离本身也进入照片。",
          "最好的画面往往出现在那些没有名字的地点之间。那时无事可做，只能停下、观看，等天气完成构图。",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/03-lindis-road.jpg",
          alt: "穿过林迪斯山口开阔地貌的公路",
          caption: "路线本身，也成为了主题。",
          location: "林迪斯山口",
          format: "wide",
        },
      },
      {
        number: "02",
        title: "与视线齐平的群山",
        place: "格林诺奇",
        paragraphs: [
          "在格林诺奇，群山不像背景，更像一面迎面而来的墙。尺度无处不在，但更安静的问题是：一个人如何从其中经过。",
          "一个微小的人影、一条窄路、一段接住光的山脊——这些比例，比宏大的全景更能说明这个地方。",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/04-glenorchy-peak.jpg",
          alt: "格林诺奇山峰上的光",
          caption: "傍晚的光停在山脉边缘。",
          location: "格林诺奇",
        },
      },
      {
        number: "03",
        title: "更安静的蓝",
        place: "蒂卡普湖",
        paragraphs: [
          "人们常用颜色描述蒂卡普。真正留在我记忆里的，却是它周围的空间：掠过湖岸的风、被缩成一个标记的人，以及寂静如何改变画面的尺度。",
          "从这里开始，旅程不再只是旅行记录，而渐渐接近我想继续做下去的作品。",
        ],
        frame: {
          src: "/journeys/newzealand-2026/photos/08-tekapo-quiet.jpg",
          alt: "蒂卡普湖岸边的独行者",
          caption: "湖边一处微小的人的痕迹。",
          location: "蒂卡普湖",
          format: "portrait",
        },
      },
    ],
    frames: [
      {
        src: "/journeys/newzealand-2026/photos/05-tekapo-pano.jpg",
        alt: "蒂卡普湖全景",
        caption: "蓝调时刻，光离开湖面之前。",
        location: "蒂卡普湖",
        format: "wide",
      },
      {
        src: "/journeys/newzealand-2026/photos/06-tekapo-portrait.jpg",
        alt: "在蒂卡普湖拍摄风景的人",
        caption: "观看的人走进了画面。",
        location: "蒂卡普湖",
        format: "portrait",
      },
      {
        src: "/journeys/newzealand-2026/photos/07-wanaka-camera.jpg",
        alt: "瓦纳卡湖边的相机与笔记本",
        caption: "水边一次工作的停顿。",
        location: "瓦纳卡",
        format: "landscape",
      },
    ],
    closing:
      "路线终止于奥拉基，照片却不断回到目的地之间的空间——旅行中那些无法被整齐钉在地图上的部分。",
  },
  "uzbekistan-2026": {
    title: "冬日丝路",
    subtitle: "塔什干、布哈拉、撒马尔罕",
    description:
      "一本关于蓝色瓷砖、苏联几何、古老故事，以及由铁路连接的三座城市的现场笔记。",
    country: "乌兹别克斯坦",
    dates: "2026 年 2 月 17 日 — 24 日",
    route: ["塔什干", "布哈拉", "撒马尔罕"],
    coverAlt: "乌兹别克斯坦的建筑与冬日光线",
    intro:
      "乌兹别克斯坦位于多重历史之间：中国的痕迹、苏联的结构、伊斯兰装饰，以及人和知识沿丝绸之路流动的古老记忆。",
    chapters: [
      {
        number: "01",
        title: "城市之下的城市",
        place: "塔什干",
        paragraphs: [
          "塔什干最先在地下显露自己。每一座地铁站都更换一种语言——大理石、马赛克、吊灯，以及苏联公共建筑冷峻而确信的气势。",
          "回到地面，冬天让城市显得克制。照片于是成为过渡的研究：旧立面与宽阔街道并置，日常生活在它们之间继续。",
        ],
      },
      {
        number: "02",
        title: "大地的颜色",
        place: "布哈拉",
        paragraphs: [
          "布哈拉更低、更暖，也更有触感。泥墙留住傍晚的光，庭院放慢脚步，蓝色瓷砖只是点缀，而非整片天空。",
          "这座城市适合没有目的地的行走。细小的门槛与磨损的表面，比任何单一纪念碑都更有说服力地承载历史。",
        ],
      },
      {
        number: "03",
        title: "留住深度的蓝",
        place: "撒马尔罕",
        paragraphs: [
          "抵达雷吉斯坦，最先出现的是尺度；随后细节接管一切：瓷砖纹样、藏在阴影里的门洞，以及从绿松石变为近乎紫色的蓝。",
          "旅程结束时，我意识到旅行不会让历史变得简单。它只是让不同世纪继续出现在同一个画面里。",
        ],
      },
    ],
    frames: [],
    closing:
      "所有宏伟都会过去。留下来的，是足够仔细地观看，并诚实记录自己曾经经过的可能。",
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
