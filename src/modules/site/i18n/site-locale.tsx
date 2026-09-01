"use client";

import {
  createContext,
  useCallback,
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
    travel: "Places",
    map: "Map",
    about: "About",
    studio: "Studio",
    menu: "Menu",
    close: "Close",
  },
  shell: {
    brandDetail: "Photographs",
    homeLabel: "YueYong Photography home",
    footerTitle: "YUEYONG",
    footerDescription: "Photographs / Places / Journeys",
    role: "Software Engineer / Photographer",
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
    eyebrow: "PORTFOLIO / 01",
    titleStart: "Photography is the",
    titleEnd: "beauty of life captured",
    heroAlt: "A red tram moving through a dense Hong Kong street",
    heroCaption: "Hong Kong / HKG",
    workEyebrow: "01 / Work",
    workTitle: "Selected photographs",
    workLink: "View all photographs",
    workEntries: [
      { title: "Untitled" },
      { title: "Untitled" },
      { title: "Untitled" },
    ],
    journeysEyebrow: "04 / Journeys",
    journeysTitle: "Journeys",
    journeysLink: "All journeys",
    travelEyebrow: "02 / Places",
    travelTitle: "PLACES",
  },
  work: {
    eyebrow: "01 / Work",
    title: "Selected photographs",
    description:
      "A smaller edit drawn from photographs made in daily life and while travelling. This page follows one sequence rather than countries or cities.",
    attribution: "",
    photographsLabel: "Photographs",
    yearsLabel: "Years",
    placesLabel: "Places",
    startLabel: "View the selection",
    selectedAlt: "Selected photograph",
    fieldStudy: "Location not recorded",
    emptyTitle: "No photographs selected",
  },
  journeys: {
    eyebrow: "04 / Journeys",
    title: "Journeys",
    descriptionLines: [
      "Photographic journeys and field notes,",
      "arranged by place, time, and the roads between them.",
    ],
    attribution: "",
    entriesLabel: "Entries",
    yearsLabel: "Years",
    featuredLabel: "Featured journey",
    read: "Open journey",
    readNote: "Open note",
    journeyLabel: "Journey",
    fieldNote: "Field note",
    draft: "Draft",
    coverPending: "Cover to be added",
    noteFallback: "A field note from the photographic archive.",
    minRead: (minutes: number) => `${minutes} min read`,
  },
  journey: {
    all: "All journeys",
    route: "Route",
    prologue: "Notes",
    contactSheet: "Photographs",
    coda: "Afterword",
    browseByPlace: (country: string) => `View ${country}`,
  },
  travel: {
    eyebrow: "02 / Places",
    title: "PLACES",
    description:
      "A geographic index of the archive — countries first, cities within, and every photograph kept close to where it was made.",
    attribution: "",
    countries: "Countries",
    cities: "Cities",
    cityMap: "Map",
    viewsLabel: "Places views",
    openCountry: "Open",
  },
  country: {
    all: "All countries",
    cityFrames: (year: string, count: number) => `${year} · ${count} frames`,
    openGallery: (city: string, count: number) =>
      `Open ${city}, ${count} photographs`,
    mapLink: "Map",
  },
  city: {
    loadingTitle: "Loading photographs",
    loadingDescription: "Please wait.",
    errorTitle: "Photographs unavailable",
    errorDescription: "Please try again later.",
    photoAlt: (city: string) => `${city} photograph`,
  },
  discover: {
    eyebrow: "03 / Map",
    title: "MAP",
    description:
      "The same photographic archive, read spatially. Move from a complete world view to the places where each frame was made.",
  },
  map: {
    title: "Every frame, somewhere.",
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
    archiveSummary: "Mapped archive summary",
    filterCountry: "Filter the map by country",
    allPlaces: "ALL",
    overview: "Overview",
    globe: "Globe",
    atlas: "Atlas",
    hideArchive: "Hide archive",
    showArchive: "Show archive",
    explorePlaces: "Explore places",
    searchPlaces: "Search cities or countries",
    noResults: "No mapped places found",
    clearSearch: "Clear search",
    mappedArchive: "Mapped archive",
    allCities: "All mapped cities",
    openCollection: "Open city collection",
    browsePlaces: "Browse places",
    close: "Close",
    closePhoto: "Close photograph",
    previousPhoto: "Previous photograph",
    nextPhoto: "Next photograph",
  },
  photo: {
    loadingTitle: "Loading photograph",
    loadingDescription: "Please wait.",
    errorTitle: "Photograph unavailable",
    errorDescription: "Please try again later.",
    locationUnknown: "Location not recorded",
    back: "Back to the archive",
    photograph: "Photograph",
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
    title: "Hi, I’m YueYong.",
    paragraphOne:
      "I’m a software engineer based in Hangzhou, China. I take photographs in everyday life and while travelling.",
    paragraphTwo:
      "This site is a collection of selected photographs and travel notes.",
    nameLabel: "Name",
    roleLabel: "Work",
    roleValue: "Software engineer / Photographer",
    practice: "On this site",
    workNote: "Edited selections",
    placesNote: "Photographs by place",
    mapNote: "Explore photographs on the map",
    journeysNote: "Travel photographs and notes",
    tools: "Equipment",
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
    work: "作品",
    journeys: "旅程",
    travel: "足迹",
    map: "地图",
    about: "关于",
    studio: "工作台",
    menu: "菜单",
    close: "关闭",
  },
  shell: {
    brandDetail: "PHOTOGRAPHS",
    homeLabel: "YueYong 摄影首页",
    footerTitle: "YUEYONG",
    footerDescription: "照片 / 足迹 / 旅程",
    role: "软件工程师 / 摄影",
    email: "邮箱",
  },
  common: {
    archive: "档案",
    untitled: "无题",
    frames: "照片",
    places: "地点",
    years: "年份",
    country: "国家",
    place: "地点",
    year: "年份",
    notRecorded: "未记录",
  },
  home: {
    eyebrow: "PORTFOLIO / 01",
    titleStart: "摄影的全部意义，",
    titleEnd: "就在于你不必用言语去解释事物",
    heroAlt: "穿行在香港密集街道中的红色电车",
    heroCaption: "香港 / HKG",
    workEyebrow: "01 / 作品",
    workTitle: "照片选集",
    workLink: "查看照片选集",
    workEntries: [
      { title: "无题" },
      { title: "无题" },
      { title: "无题" },
    ],
    journeysEyebrow: "04 / 旅程",
    journeysTitle: "JOURNEYS",
    journeysLink: "全部旅程",
    travelEyebrow: "02 / 足迹",
    travelTitle: "足迹",
  },
  work: {
    eyebrow: "01 / 选集",
    title: "照片选集",
    description: "删繁就简三秋树，\n领异标新二月花。",
    attribution: "郑燮",
    photographsLabel: "照片",
    yearsLabel: "拍摄年份",
    placesLabel: "地点",
    startLabel: "浏览照片",
    selectedAlt: "精选摄影作品",
    fieldStudy: "地点待补",
    emptyTitle: "暂无照片",
  },
  journeys: {
    eyebrow: "04 / 旅程",
    title: "旅程",
    descriptionLines: ["两岸青山相对出，", "孤帆一片日边来。"],
    attribution: "李白《望天门山》",
    entriesLabel: "记录",
    yearsLabel: "年份",
    featuredLabel: "精选旅程",
    read: "查看旅程",
    readNote: "查看笔记",
    journeyLabel: "旅行记录",
    fieldNote: "路上笔记",
    draft: "草稿",
    coverPending: "封面待补",
    noteFallback: "这篇路上笔记还没有摘要。",
    minRead: (minutes: number) => `约 ${minutes} 分钟读完`,
  },
  journey: {
    all: "全部旅程",
    route: "路线",
    prologue: "记录",
    contactSheet: "照片",
    coda: "后记",
    browseByPlace: (country: string) => `查看${country}`,
  },
  travel: {
    eyebrow: "02 / 足迹",
    title: "足迹",
    description: "人生到处知何似？\n应似飞鸿踏雪泥。",
    attribution: "苏轼《和子由渑池怀旧》",
    countries: "国家",
    cities: "城市",
    cityMap: "地图",
    viewsLabel: "浏览方式",
    openCountry: "查看",
  },
  country: {
    all: "全部地点",
    cityFrames: (year: string, count: number) => `${year} · ${count} 张`,
    openGallery: (city: string, count: number) =>
      `打开${city}，查看 ${count} 张照片`,
    mapLink: "地图",
  },
  city: {
    loadingTitle: "照片加载中",
    loadingDescription: "请稍候。",
    errorTitle: "无法加载照片",
    errorDescription: "请稍后重试。",
    photoAlt: (city: string) => `${city}的照片`,
  },
  discover: {
    eyebrow: "03 / 地图",
    title: "地图",
    description: "换一种空间视角阅读同一份照片档案；从完整的世界，走近每一张照片拍下的地方。",
  },
  map: {
    title: "每一帧，\n都有坐标。",
    fallbackTitle: "地图暂时打不开",
    fallbackDescription: "下面的城市列表仍然可以正常浏览。",
    fallbackLabel: "拍过照片的城市地图",
    unknownPlace: "地点待补",
    markerLabel: (city: string, count: number) =>
      `打开${city}的 ${count} 张照片`,
    openCity: "进入这座城市 ↗",
    photos: "照片",
    items: "张",
    loadingMap: "地图加载中…",
    loading: "正在加载…",
    loadMore: "再看一些",
    imageError: "这张照片加载失败",
    archiveSummary: "地图档案概览",
    filterCountry: "按国家筛选地图",
    allPlaces: "全部",
    overview: "世界视角",
    globe: "地球",
    atlas: "地图",
    hideArchive: "收起档案",
    showArchive: "展开档案",
    explorePlaces: "探索地点",
    searchPlaces: "搜索城市或国家",
    noResults: "没有找到对应地点",
    clearSearch: "清空搜索",
    mappedArchive: "地图档案",
    allCities: "全部城市",
    openCollection: "打开城市照片集",
    browsePlaces: "浏览足迹",
    close: "关闭",
    closePhoto: "关闭照片",
    previousPhoto: "上一张照片",
    nextPhoto: "下一张照片",
  },
  photo: {
    loadingTitle: "照片加载中",
    loadingDescription: "请稍候。",
    errorTitle: "无法加载照片",
    errorDescription: "请稍后重试。",
    locationUnknown: "拍摄地点待补",
    back: "回到上一组照片",
    photograph: "照片",
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
    title: "见山之后",
    paragraphOne:
      "“我之所以写徐霞客，是想告诉你：所谓百年功名、千秋霸业、万古流芳，与一件事情相比，其实算不了什么。这件事情就是——用你喜欢的方式度过一生。”。 ——当年明月",
    paragraphTwo: "",
    nameLabel: "名字",
    roleLabel: "平时做什么",
    roleValue: "写代码 / 拍照",
    practice: "这个网站",
    workNote: "挑出来的照片",
    placesNote: "按地点整理的照片",
    mapNote: "在地图上查看照片",
    journeysNote: "旅行照片和路上笔记",
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
    let savedLocale: string | null = null;

    try {
      savedLocale = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Language switching must still work when browser storage is unavailable.
    }

    const preferredLocale = navigator.language.toLowerCase().startsWith("zh")
      ? "zh-CN"
      : "en";

    setLocaleState(isSiteLocale(savedLocale) ? savedLocale : preferredLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: SiteLocale) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;

    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // Persisting the preference is optional; changing the language is not.
    }
  }, []);

  const value = useMemo(
    () => ({ locale, copy: dictionaries[locale], setLocale }),
    [locale, setLocale],
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
  HK: "中国香港",
  IS: "冰岛",
  IT: "意大利",
  JP: "日本",
  KR: "韩国",
  MY: "马来西亚",
  NZ: "新西兰",
  NO: "挪威",
  SG: "新加坡",
  TH: "泰国",
  TR: "土耳其",
  TW: "中国台湾",
  US: "美国",
  UZ: "乌兹别克斯坦",
};

const placeNames: Record<string, string> = {
  Akureyri: "阿克雷里",
  Anqing: "安庆",
  "Aoraki / Mount Cook": "奥拉基 / 库克山",
  Aoraki: "奥拉基",
  Arrowtown: "箭镇",
  Beijing: "北京",
  Beyoğlu: "贝伊奥卢",
  "Bortala Mongol Autonomous Prefecture": "博尔塔拉蒙古自治州",
  Bukhara: "布哈拉",
  Cambridge: "剑桥",
  Chongqing: "重庆",
  "Dali Bai Autonomous Prefecture": "大理白族自治州",
  Dalian: "大连",
  Dover: "多佛",
  Edinburgh: "爱丁堡",
  Glenorchy: "格林诺奇",
  Hangzhou: "杭州",
  Höfn: "霍芬",
  "Hong Kong": "香港",
  Hvolsvöllur: "霍尔斯沃德吕尔",
  "Ili Kazakh Autonomous Prefecture": "伊犁哈萨克自治州",
  "K. Rampayan Village": "兰帕延村",
  Kadıköy: "卡德柯伊",
  Kirkjubæjarklaustur: "教堂城",
  "Kota Kinabalu": "亚庇",
  Kyoto: "京都",
  "Lake Tekapo": "蒂卡普湖",
  "Lindis Pass": "林迪斯山口",
  London: "伦敦",
  Mývatn: "米湖",
  Nanjing: "南京",
  Ningbo: "宁波",
  Osaka: "大阪",
  Oslo: "奥斯陆",
  Osmangazi: "奥斯曼加齐",
  Oxford: "牛津",
  Öræfasveit: "厄赖法斯韦特",
  Queenstown: "皇后镇",
  Reine: "雷讷",
  Reykjavík: "雷克雅未克",
  Saga: "佐贺",
  Samarkand: "撒马尔罕",
  "Samarkand City": "撒马尔罕",
  Selfoss: "塞尔福斯",
  Shanghai: "上海",
  Shaoxing: "绍兴",
  Snæfellsbær: "斯奈费尔斯拜尔",
  Sydney: "悉尼",
  Tashkent: "塔什干",
  Tekapo: "蒂卡普",
  Tianjin: "天津",
  Ürümqi: "乌鲁木齐",
  Üsküdar: "于斯屈达尔",
  "Vík í Mýrdal": "维克",
  Wānaka: "瓦纳卡",
  Wanaka: "瓦纳卡",
  Wuhan: "武汉",
  Xiamen: "厦门",
  "Xihu District": "西湖区",
  Yamanashi: "山梨",
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
    title: "新西兰，2026",
    subtitle: "新西兰公路笔记",
    description:
      "新西兰旅行记录，先从皇后镇至奥拉基这一段开始整理。",
    country: "新西兰",
    dates: "2026 年 4 月 26 日至 5 月 2 日",
    route: ["皇后镇", "格林诺奇", "瓦纳卡", "蒂卡普", "奥拉基"],
    coverAlt: "一人站在新西兰特卡波湖畔，远处是连绵的雪山",
    intro: "目前先整理南岛从皇后镇到奥拉基这一段，北岛照片之后补进同一项目。",
    chapters: [
      {
        number: "01",
        title: "林迪斯山口",
        place: "林迪斯山口",
        paragraphs: [
          "从皇后镇向北，经过林迪斯山口。这里的照片拍于公路沿线的几次临时停车。",
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
        title: "格林诺奇",
        place: "格林诺奇",
        paragraphs: [
          "到格林诺奇时接近傍晚。这张照片拍于路边，山脊仍有阳光。",
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
        title: "蒂卡普湖",
        place: "蒂卡普湖",
        paragraphs: [
          "蒂卡普湖，当天风很大。照片从远处拍摄，人物位于湖岸。",
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
    closing: "奥拉基是这段行程的最后一站。",
  },
  "uzbekistan-2026": {
    title: "乌兹别克斯坦",
    subtitle: "塔什干 / 布哈拉 / 撒马尔罕",
    description:
      "2026 年 2 月 17 日至 24 日，乘火车经过三座城市。",
    country: "乌兹别克斯坦",
    dates: "2026 年 2 月 17 日至 24 日",
    route: ["塔什干", "布哈拉", "撒马尔罕"],
    coverAlt: "乌兹别克斯坦的建筑与冬日光线",
    intro: "城市之间乘火车。",
    chapters: [
      {
        number: "01",
        title: "塔什干",
        place: "塔什干",
        paragraphs: [
          "在塔什干主要拍了地铁站和街道。部分车站铺有大理石，站厅悬挂吊灯。",
        ],
      },
      {
        number: "02",
        title: "布哈拉",
        place: "布哈拉",
        paragraphs: [
          "布哈拉的建筑较低，街道也比塔什干窄。照片集中在傍晚的土墙、门和院子。",
        ],
      },
      {
        number: "03",
        title: "撒马尔罕",
        place: "撒马尔罕",
        paragraphs: [
          "在雷吉斯坦拍了瓷砖纹样、门洞和建筑立面。",
        ],
      },
    ],
    frames: [],
    closing: "撒马尔罕是这段行程的最后一站。",
  },
  "norway-2025": {
    title: "挪威，2025",
    subtitle: "弗洛姆 / 盖朗厄尔 / 罗弗敦",
    description: "挪威西部峡湾到罗弗敦的第一版选片。",
    country: "挪威",
    dates: "2025 年 11 月 18 日至 27 日",
    route: ["弗洛姆", "盖朗厄尔", "罗弗敦"],
    coverAlt: "挪威北部尼克松附近雾中的群山与海面",
    intro: "这一版先按路线排：临水的村子、渡轮，以及路上不断变化的天气。",
    chapters: [
      {
        number: "01",
        title: "水边",
        place: "弗洛姆",
        paragraphs: ["港口、铁路和公路放在这一组，顺序和图注还在核对。"],
      },
      {
        number: "02",
        title: "渡轮之间",
        place: "盖朗厄尔",
        paragraphs: ["这一组是几次过渡轮，以及峡湾之间短暂停车时拍的照片。"],
      },
      {
        number: "03",
        title: "红房子",
        place: "罗弗敦",
        paragraphs: ["从渔村开始，之后沿着海岸继续往外走。"],
      },
    ],
    frames: [],
    closing: "目前是工作版本，照片和现场笔记会继续补进来。",
  },
  "iceland-2025": {
    title: "冰岛，2025",
    subtitle: "雷克雅未克 / 维克 / 斯奈山半岛",
    description: "火山地貌、沿途天气，以及海岸边很长的蓝色时段。",
    country: "冰岛",
    dates: "2025 年 10 月 3 日至 10 日",
    route: ["雷克雅未克", "维克", "斯奈山半岛"],
    coverAlt: "穿红色外套的摄影者站在冰岛火山地貌中",
    intro: "现在先按公路和天气排片，具体地点与图注仍在补。",
    chapters: [
      {
        number: "01",
        title: "第一晚",
        place: "雷克雅未克",
        paragraphs: ["开头几张拍在城市边缘，第二天才正式向南。"],
      },
      {
        number: "02",
        title: "南岸",
        place: "维克",
        paragraphs: ["黑色地面、低云和沿海公路上的几次停车。"],
      },
      {
        number: "03",
        title: "天气转坏",
        place: "斯奈山半岛",
        paragraphs: ["最后一组拍在半岛，风雨到来前后各留了一些照片。"],
      },
    ],
    frames: [],
    closing: "地点、日期和最后的照片顺序还在核对。",
  },
  "japan-saga-2025": {
    title: "佐贺，2025",
    subtitle: "有田 / 唐津 / 呼子",
    description: "佐贺的初版选片：陶瓷小镇、通往海边的路和港口。",
    country: "日本",
    dates: "2025 年 7 月 10 日至 20 日",
    route: ["有田", "唐津", "呼子"],
    coverAlt: "日本佐贺的陶瓷鸟居与神社建筑",
    intro: "从有田开始，向北走到海边。地点名称和图注暂时按工作稿保留。",
    chapters: [
      {
        number: "01",
        title: "陶瓷之町",
        place: "有田",
        paragraphs: ["窑厂、店面和陶瓷细节放在第一组。"],
      },
      {
        number: "02",
        title: "去海边",
        place: "唐津",
        paragraphs: ["离开町中心后，沿着公路一路向海边。"],
      },
      {
        number: "03",
        title: "港口",
        place: "呼子",
        paragraphs: ["船、市场街道和清晨的港口放在最后。"],
      },
    ],
    frames: [],
    closing: "照片已经在这里，最终顺序和文字还没定。",
  },
  "london-2024": {
    title: "英国，2024",
    subtitle: "海德公园角 / 苏活 / 伦敦城",
    description:
      "英国旅程的第一版选片，先从伦敦的公交、黑色出租车和街道路口开始。",
    country: "英国",
    dates: "2024 年",
    route: ["海德公园角", "苏活", "伦敦城"],
    coverAlt: "红色双层公交穿过伦敦海德公园角",
    intro:
      "英国旅程先从伦敦街头开始：从海德公园角跟着车流走进苏活，最后停在伦敦城的新旧建筑之间。",
    chapters: [
      {
        number: "01",
        title: "街面",
        place: "海德公园角",
        paragraphs: [
          "开头先看马路。公交离站、骑车的人等灯，行人从几条车道之间穿过去。",
          "红色公交一眼就能交代伦敦。这组照片留意的是车身周围那些短暂的空隙，以及人和车偶然排进同一张画面的时刻。",
        ],
      },
      {
        number: "02",
        title: "散场以后",
        place: "苏活",
        paragraphs: [
          "到了苏活，街道窄下来。店面、剧院招牌和晚场前后排队的人，替代了开头那些宽阔的路口。",
          "这一段按步行的速度排，镜头离人更近，也多留了一些街边不太起眼的细节。",
        ],
      },
      {
        number: "03",
        title: "石头与玻璃",
        place: "伦敦城",
        paragraphs: [
          "最后一组向东走。旧石墙和新玻璃楼站在一起，上班的人从它们中间经过。",
          "这里的照片安静一些，更多是窗格、深色外套和路面标线。",
        ],
      },
    ],
    frames: [],
    closing:
      "英国旅程的第一章目前先在伦敦城收尾；随着选片继续，之后还可以加入更多地方。",
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
