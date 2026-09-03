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

import type {
  JourneyChapter,
  JourneyFrame,
  JourneyMeta,
} from "@/modules/journeys/data/journeys";

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
    eyebrow: "PORTFOLIO",
    titleStart: "Photography is the",
    titleEnd: "beauty of life captured",
    heroAlt: "A red tram moving through a dense Hong Kong street",
    heroCaption: "Hong Kong / HKG",
    workEyebrow: "Work",
    workTitle: "Selected photographs",
    workLink: "View all photographs",
    workEntries: [
      { title: "Untitled" },
      { title: "Untitled" },
      { title: "Untitled" },
    ],
    journeysEyebrow: "Journeys",
    journeysTitle: "Journeys",
    journeysLink: "All journeys",
    travelEyebrow: "Places",
    travelTitle: "PLACES",
  },
  work: {
    eyebrow: "Work",
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
    eyebrow: "Journeys",
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
    eyebrow: "Places",
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
    cityAlbums: "City albums",
    openCityAlbum: (city: string, count: number) =>
      `Open ${city} album, ${count} photographs`,
    cityFrames: (year: string, count: number) => `${year} · ${count} frames`,
    openPhoto: (title: string, city: string, index: number, count: number) =>
      `Open ${title}, photograph ${index} of ${count} from ${city}`,
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
    eyebrow: "Map",
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
    eyebrow: "About",
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
    eyebrow: "PORTFOLIO",
    titleStart: "摄影的全部意义，",
    titleEnd: "就在于你不必用言语去解释事物",
    heroAlt: "穿行在香港密集街道中的红色电车",
    heroCaption: "香港 / HKG",
    workEyebrow: "作品",
    workTitle: "照片选集",
    workLink: "查看照片选集",
    workEntries: [
      { title: "无题" },
      { title: "无题" },
      { title: "无题" },
    ],
    journeysEyebrow: "旅程",
    journeysTitle: "JOURNEYS",
    journeysLink: "全部旅程",
    travelEyebrow: "足迹",
    travelTitle: "足迹",
  },
  work: {
    eyebrow: "选集",
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
    eyebrow: "旅程",
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
    eyebrow: "足迹",
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
    cityAlbums: "城市专辑",
    openCityAlbum: (city: string, count: number) =>
      `打开${city}专辑，共 ${count} 张照片`,
    cityFrames: (year: string, count: number) => `${year} · ${count} 张`,
    openPhoto: (title: string, city: string, index: number, count: number) =>
      `打开${title}，${city}第 ${index} 张，共 ${count} 张`,
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
    eyebrow: "地图",
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
    eyebrow: "关于",
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

type JourneyCopyTranslation = Pick<
  JourneyMeta,
  | "title"
  | "subtitle"
  | "description"
  | "country"
  | "dates"
  | "route"
  | "coverAlt"
  | "intro"
  | "closing"
> & {
  chapters: Array<
    Pick<JourneyChapter, "title" | "place" | "paragraphs"> & {
      frame?: Pick<JourneyFrame, "alt" | "caption" | "location">;
    }
  >;
  frames: Array<Pick<JourneyFrame, "alt" | "caption" | "location">>;
};

const completedJourneyTranslations: Record<string, JourneyCopyTranslation> = {
  "newzealand-2026": {
    title: "新西兰，2026",
    subtitle: "南岛七站",
    description: "从瓦卡蒂普湖一路开往奥拉基，沿途是深秋、公路与湖边小镇。",
    country: "新西兰",
    dates: "2026 年 4 月 25 日至 5 月 2 日",
    route: [
      "格林诺奇",
      "天堂镇",
      "阿罗敦",
      "瓦纳卡",
      "特威泽尔",
      "奥拉基",
      "蒂卡普湖",
    ],
    coverAlt: "一人站在蒂卡普湖畔，湖对岸是连绵的群山",
    intro:
      "八天的南岛行程从瓦卡蒂普湖最北端拐向麦肯齐盆地。路边的秋色渐渐退去，窗外换成大片草坡、冰川河谷和蒂卡普清亮的蓝色。",
    chapters: [
      {
        title: "公路抵达湖边",
        place: "格林诺奇",
        paragraphs: [
          "公路走到瓦卡蒂普湖北端，格林诺奇就到了。山脚下的小屋给第一组照片标出了尺度，剩下的位置几乎都被山占满。",
          "行程从这里慢下来。镜头贴近地面，留下山脚少量的人居痕迹。",
        ],
        frame: {
          alt: "格林诺奇秋日群山脚下的一间小屋",
          caption: "山脚下的一间小屋。",
          location: "格林诺奇",
        },
      },
      {
        title: "越过最后的小镇",
        place: "天堂镇",
        paragraphs: [
          "过了格林诺奇，路变窄，地名也渐渐稀疏。天堂镇一带的湖面很静，积雪沿着远处山脊排开，小路贴着水边继续向前。",
          "几张大景之间夹着更小的停顿。一个弯道，一片树林，还有压在山脊上的一朵云。",
        ],
        frame: {
          alt: "天堂镇附近沿山地湖泊转弯的公路",
          caption: "格林诺奇以北的路。",
          location: "天堂镇",
        },
      },
      {
        title: "深秋给出的方向",
        place: "阿罗敦",
        paragraphs: [
          "阿罗敦已经进入深秋。铜色和黄色的树叶压低了街巷，旧屋顶和路牌从枝叶间露出来。",
          "最简单的一张照片刚好也最有用。三块路牌立在树下，一边指回皇后镇，一边通往小镇深处。",
        ],
        frame: {
          alt: "阿罗敦秋叶下的街道路牌",
          caption: "秋叶下面的三个方向。",
          location: "阿罗敦",
        },
      },
      {
        title: "在湖边停一会儿",
        place: "瓦纳卡",
        paragraphs: [
          "瓦纳卡这一组按照步行的速度来排。行人从黄色树木下面走过浅色湖岸，远山落在湖的另一边。",
          "草地上的相机和电脑临时组成了一张工作台。车还要继续往前开，选片已经从这里开始。",
        ],
        frame: {
          alt: "瓦纳卡湖边草地上的相机与电脑",
          caption: "湖边的临时工作台。",
          location: "瓦纳卡",
        },
      },
      {
        title: "风景走进房间",
        place: "特威泽尔",
        paragraphs: [
          "特威泽尔附近，一整面窗把湖和群山收进室内。窗下只有一张空长椅，画面也不需要更多东西。",
          "连续几天透过挡风玻璃和取景器看路，这次终于可以坐下。公路留在窗外，下一程也在那里。",
        ],
        frame: {
          alt: "特威泽尔附近面朝湖泊与群山的窗和长椅",
          caption: "从室内看麦肯齐的山水。",
          location: "特威泽尔",
        },
      },
      {
        title: "沿着冰川水前进",
        place: "奥拉基",
        paragraphs: [
          "去奥拉基的路沿着辫状河进入陡峭山谷。岩石、冰雪和云把画面分成粗粝的几层，每一层都留着不同的冷光。",
          "竖幅照片让河水从前景一直引向雪山。公路已经把山拉得很近，镜头里的距离仍旧没有消失。",
        ],
        frame: {
          alt: "流向奥拉基雪山的冰川河流",
          caption: "去往奥拉基途中经过的冰川水。",
          location: "奥拉基",
        },
      },
      {
        title: "给蓝色留出位置",
        place: "蒂卡普湖",
        paragraphs: [
          "到了蒂卡普，颜色已经足够说明很多事。蓝色湖面、浅黄草地和雪山各占一块，岸边的人只剩下一枚很小的深色标记。",
          "最后几张照片退到远处，把湖边小镇和离开的公路也放进来。行程在重新出现的距离感里结束。",
        ],
        frame: {
          alt: "一人站在蒂卡普湖畔的金色草丛中",
          caption: "湖岸边的人。",
          location: "蒂卡普湖",
        },
      },
    ],
    frames: [
      {
        alt: "天堂镇附近的静水与雪山",
        caption: "格林诺奇以北的静水。",
        location: "天堂镇",
      },
      {
        alt: "被彩色秋叶围住的阿罗敦",
        caption: "藏在秋色下面的小镇。",
        location: "阿罗敦",
      },
      {
        alt: "沿瓦纳卡湖岸散步的人",
        caption: "湖岸边的一个下午。",
        location: "瓦纳卡",
      },
      {
        alt: "群山和秋树下的蒂卡普湖小镇",
        caption: "从小镇上方望向湖面。",
        location: "蒂卡普湖",
      },
      {
        alt: "停在怀塔基山谷公路旁的汽车",
        caption: "离开前再停一次。",
        location: "怀塔基",
      },
    ],
    closing: "南岛这一段停在另一条公路上。山已经退到后视镜里，下一个弯还看不见。",
  },
  "uzbekistan-2026": {
    title: "丝路冬行",
    subtitle: "塔什干 / 布哈拉 / 撒马尔罕",
    description: "坐火车经过三座城市，从地下站厅、土色街巷一直看到蓝色砖墙。",
    country: "乌兹别克斯坦",
    dates: "2026 年 2 月 10 日至 18 日",
    route: ["塔什干", "布哈拉", "撒马尔罕"],
    coverAlt: "撒马尔罕历史建筑内金色与蓝色交织的装饰",
    intro:
      "铁路给这段行程画出了一条清楚的线。塔什干、布哈拉和撒马尔罕在冬日里依次出现，照片也从公共空间走进旧院落，最后停在撒马尔罕层层叠叠的纹饰上。",
    chapters: [
      {
        title: "城市下面的城市",
        place: "塔什干",
        paragraphs: [
          "塔什干先从地下出现。长站厅、光亮的地面和有图案的墙面，让每一座车站都有自己的秩序。",
          "通勤的人照常穿过这些对称空间。他们的脚步把宏大的室内重新放回日常。",
        ],
        frame: {
          alt: "行人穿过塔什干一座有纹饰的地铁站厅",
          caption: "日常路线穿过礼仪感很强的室内。",
          location: "塔什干",
        },
      },
      {
        title: "砖墙、木雕和斜阳",
        place: "布哈拉",
        paragraphs: [
          "到了布哈拉，视线低下来。砖墙和木雕填满照片，修补与使用留下的痕迹也都还在。",
          "一只鸟停在木阳台上，刚好替画面标出了大小。读这座城，可以先从伸手够得到的细节开始。",
        ],
        frame: {
          alt: "布哈拉阳光下的砖墙和木雕立柱",
          caption: "斜阳落在砖墙和木雕上。",
          location: "布哈拉",
        },
      },
      {
        title: "不断变化的蓝",
        place: "撒马尔罕",
        paragraphs: [
          "撒马尔罕需要反复走近。一道拱门框住宣礼塔，穿过通道又能看见蓝色穹顶，同一片瓷砖会随着日光变色。",
          "进入室内，镜头开始向上。金色几何纹和星空一样的顶棚收住了这组照片，也把宏大的城市压进一圈细密装饰里。",
        ],
        frame: {
          alt: "撒马尔罕的瓷砖拱门框住宣礼塔与蓝天",
          caption: "宣礼塔落在另一道拱门里。",
          location: "撒马尔罕",
        },
      },
    ],
    frames: [
      {
        alt: "一只鸟停在布哈拉的木雕阳台上",
        caption: "木雕之间的一位小住客。",
        location: "布哈拉",
      },
      {
        alt: "行人穿过撒马尔罕的拱门，远处露出蓝色穹顶",
        caption: "城市从一道道门后出现。",
        location: "撒马尔罕",
      },
      {
        alt: "一位老人独自坐在撒马尔罕公园长椅上",
        caption: "冬日公园里的太阳。",
        location: "撒马尔罕",
      },
      {
        alt: "撒马尔罕一处蓝金相间的华丽顶棚",
        caption: "最后一张，镜头笔直向上。",
        location: "撒马尔罕",
      },
    ],
    closing: "火车线停在撒马尔罕。最后几张照片留在室内，抬头看一片被做成天空的顶棚。",
  },
  "norway-2025": {
    title: "挪威，2025",
    subtitle: "奥斯陆 / 雷讷",
    description: "两张挪威竖幅，一张留在雨中的城市，一张留在罗弗敦山脚的渔村。",
    country: "挪威",
    dates: "2025 年 10 月 5 日至 6 日",
    route: ["奥斯陆", "雷讷"],
    coverAlt: "挪威雷讷陡峭山峰下的红色渔屋",
    intro:
      "这篇很短的挪威笔记只留下两张照片。它们相隔一天，地点却相距很远，所以编排时也保留了这段距离。",
    chapters: [
      {
        title: "按步行速度落下的雨",
        place: "奥斯陆",
        paragraphs: [
          "奥斯陆被收进一条湿漉漉的街。撑伞的人从画面中间走过，建筑和路面一起退进灰色里。",
          "这里没有城市全景。天气、步幅和窄长的竖幅已经把城市放回人的尺度。",
        ],
        frame: {
          alt: "撑伞行人走过奥斯陆的雨中街道",
          caption: "雨水和一位路人组成的奥斯陆。",
          location: "奥斯陆",
        },
      },
      {
        title: "山脚下的红色",
        place: "雷讷",
        paragraphs: [
          "雷讷的红色渔屋贴着水边，陡峭山体几乎从屋后直接升起。",
          "竖幅把村庄、岩壁和云层一层层叠起来。一张照片刚好可以装下这篇罗弗敦短记。",
        ],
        frame: {
          alt: "雷讷陡峭山峰下的红色渔屋",
          caption: "雷讷建在水与岩石之间。",
          location: "雷讷",
        },
      },
    ],
    frames: [],
    closing: "两张照片写不完一个国家。它们留下了湿街到海面的骤然转换，也留下了低云城市和满幅山体之间的距离。",
  },
  "iceland-2025": {
    title: "冰岛，2025",
    subtitle: "沿着天气与水走完七天环线",
    description: "从雷克雅未克向南，经过米湖和阿克雷里，再在极光下面折向西边。",
    country: "冰岛",
    dates: "2025 年 9 月 28 日至 10 月 4 日",
    route: [
      "雷克雅未克",
      "塞尔福斯",
      "赫沃尔斯沃德吕尔",
      "维克",
      "赫本",
      "厄赖法冰原",
      "教堂镇",
      "米湖",
      "阿克雷里",
      "斯奈山",
    ],
    coverAlt: "穿红色外套的摄影者走过米湖火山地貌",
    intro:
      "路线从雷克雅未克出发，最后也回到这里，大多数照片却都朝向城外。雨扫过南岸，冰川水切开黑色地面，北部和西部的最后几晚亮起极光。",
    chapters: [
      {
        title: "石墙伸向天空",
        place: "雷克雅未克",
        paragraphs: [
          "哈尔格林姆斯教堂是这组照片里的第一条竖线。层叠的混凝土穿进白色天空，入口处的游客也举起手机拍同一个方向。",
          "一周以后，城市在彩色房屋之间重新出现。街道一路向下，尽头就是海。",
        ],
        frame: {
          alt: "游客在阴天下拍摄哈尔格林姆斯教堂",
          caption: "旅程从仰起镜头开始。",
          location: "雷克雅未克",
        },
      },
      {
        title: "第一面水墙",
        place: "塞尔福斯",
        paragraphs: [
          "向南的第一天隔着水雾拍下瀑布。水从雾后落下，竖幅从上到下几乎全被填满。",
          "公路、天空和地平线都在水边消失了。城市已经留在身后，天气开始接管构图。",
        ],
        frame: {
          alt: "塞尔福斯附近被水雾遮住一部分的大瀑布",
          caption: "向南的公路先走进水雾。",
          location: "塞尔福斯",
        },
      },
      {
        title: "站在雨里",
        place: "赫沃尔斯沃德吕尔",
        paragraphs: [
          "赫沃尔斯沃德吕尔的雨里，一个人张开双臂。动作很短，湿地和被云压软的地平线留在他身后。",
          "红色外套还会在后面的行程里出现。它先在这里替灰色大地标出了位置。",
        ],
        frame: {
          alt: "穿红色外套的人在赫沃尔斯沃德吕尔雨中张开双臂",
          caption: "雨穿过南部平原。",
          location: "赫沃尔斯沃德吕尔",
        },
      },
      {
        title: "大西洋画出边界",
        place: "维克",
        paragraphs: [
          "从空中看维克，海岸成了一条很干净的边。白浪推过黑沙，退下去，再把这条线重新画一遍。",
          "航拍抹掉了熟悉的尺度。海浪、沙滩和暗色海面不断重复，最后接近一张平面图形。",
        ],
        frame: {
          alt: "航拍维克附近大西洋海浪与黑沙滩交界处",
          caption: "每一层浪都重画一次海岸。",
          location: "维克",
        },
      },
      {
        title: "冰抵达海边",
        place: "赫本",
        paragraphs: [
          "赫本附近，一块透明的冰留在黑沙上。边缘接住仅有的一点光，它已经离开塑造它的冰川。",
          "镜头靠得很近。整片冰川地貌被缩到潮水能够碰到的一件临时物体上。",
        ],
        frame: {
          alt: "赫本附近黑沙滩上的透明冰块",
          caption: "抵达大西洋边缘的冰川碎片。",
          location: "赫本",
        },
      },
      {
        title: "从空中读冰川",
        place: "厄赖法冰原",
        paragraphs: [
          "厄赖法冰原从空中看满是褶皱和暗色缝隙。融水在边缘汇集，又把同样的线条带进山谷。",
          "窄长的航拍照片顺着这些痕迹排下去。冰、泥沙和水共用画面里的一条通道。",
        ],
        frame: {
          alt: "厄赖法冰原布满褶皱的冰川航拍",
          caption: "从空中看见的冰川纹路。",
          location: "厄赖法冰原",
        },
      },
      {
        title: "河流占据山谷",
        place: "教堂镇",
        paragraphs: [
          "在教堂镇一带，无人机沿着河流穿过陡峭绿地。水绕过岩石，分开，又汇在一起，最后从视线里跌落。",
          "三张相邻画面把山谷变成一组关于方向的练习。镜头留在高处，运动都交给河水。",
        ],
        frame: {
          alt: "教堂镇附近穿过绿色山谷的河流与瀑布",
          caption: "河流决定画面的方向。",
          location: "教堂镇",
        },
      },
      {
        title: "火山地表上的红色",
        place: "米湖",
        paragraphs: [
          "米湖一带展开成暗色火山地表和低矮远山。穿红色外套的摄影者带着三脚架从画面中间走过。",
          "人物替地貌标出了尺度，也把拍照这个动作留在了照片里面。",
        ],
        frame: {
          alt: "穿红色外套的摄影者扛着三脚架走过米湖",
          caption: "带着三脚架穿过火山平原。",
          location: "米湖",
        },
      },
      {
        title: "秋日公路上方的绿色",
        place: "阿克雷里",
        paragraphs: [
          "去阿克雷里的路两边都是黄叶。连续几天的裸地和冰雪之间，普通的秋色短暂回来了一次。",
          "天黑以后，颜色移到头顶。两次曝光留下极光横穿近乎空白的夜空。",
        ],
        frame: {
          alt: "绿色极光划过阿克雷里附近夜空",
          caption: "秋日公路暗下来以后的天空。",
          location: "阿克雷里",
        },
      },
      {
        title: "最后一道竖直的光",
        place: "斯奈山",
        paragraphs: [
          "最后一张夜景拍在斯奈山。一道竖直极光升到暗色前景上方，画面里几乎没有别的东西争夺视线。",
          "天亮以后，路线折回雷克雅未克。这一周回到起点，最后一处地貌却完全留给了夜晚。",
        ],
        frame: {
          alt: "斯奈山上方一道竖直的绿色极光",
          caption: "西部半岛的最后一晚。",
          location: "斯奈山",
        },
      },
    ],
    frames: [
      {
        alt: "厄赖法冰原融水切过暗色沉积物",
        caption: "冰川边缘的融水。",
        location: "厄赖法冰原",
      },
      {
        alt: "明亮河流穿过教堂镇附近绿色山坡",
        caption: "绿谷里的水。",
        location: "教堂镇",
      },
      {
        alt: "阿克雷里一条铺满黄叶的秋日公路",
        caption: "秋色短暂回来。",
        location: "阿克雷里",
      },
      {
        alt: "雷克雅未克彩色房屋间通向海边的街道",
        caption: "回到雷克雅未克，街道尽头是海。",
        location: "雷克雅未克",
      },
    ],
    closing: "七天以后，环线回到雷克雅未克。水留在几乎每一张照片里，从高处落下，结成冰，撞上海岸，也倒映夜空。",
  },
  "japan-saga-2025": {
    title: "佐贺，2025",
    subtitle: "武雄 / 佐贺市 / 有田",
    description: "两天的佐贺短记，经过铁路线、河边窄巷和有田的陶瓷街道。",
    country: "日本",
    dates: "2025 年 9 月 12 日至 13 日",
    route: ["武雄", "佐贺市", "有田"],
    coverAlt: "日本佐贺一间放满旧物、亮着暖光的房间",
    intro: "这组照片从武雄走到佐贺市和有田。铁路、河边安静的窄巷和陶瓷细节，让三处地方各有自己的速度。",
    chapters: [
      {
        title: "铁路线与书",
        place: "武雄",
        paragraphs: [
          "开头几张面对铁轨。轨道平行伸进远处，一列白色列车从中间切过。",
          "武雄后来又在一间摆满书的房间里出现。公共交通和阅读桌，给这座城留下了两种安静的公共空间。",
        ],
        frame: {
          alt: "白色列车驶过武雄的铁轨",
          caption: "进入佐贺县的第一段移动。",
          location: "武雄",
        },
      },
      {
        title: "河边的一条窄巷",
        place: "佐贺市",
        paragraphs: [
          "佐贺市只留下一条靠近河边的窄巷。墙、电线杆和一小段空路，把视线引进竖幅深处。",
          "它夹在前后两组照片之间，篇幅很短。一条普通街道也能清楚标出行程所在的位置。",
        ],
        frame: {
          alt: "佐贺市河边一条安静的窄巷",
          caption: "两个目的地之间的一条普通街道。",
          location: "佐贺市",
        },
      },
      {
        title: "陶瓷之町",
        place: "有田",
        paragraphs: [
          "有田是这篇里数量最多的一组。陶瓷鸟居、瓷砖细节、浓绿街巷和旧房间，都集中在相距不远的几条街上。",
          "照片在烧制后的表面和生长中的枝叶之间来回。暖色室内收住这一组，最后留下一小片安静倒影。",
        ],
        frame: {
          alt: "有田一间有木书架和旧物的暖光房间",
          caption: "陶瓷小镇里的一间安静房间。",
          location: "有田",
        },
      },
    ],
    frames: [
      {
        alt: "向远处延伸的武雄铁轨",
        caption: "车站里的平行线。",
        location: "武雄",
      },
      {
        alt: "武雄木书架上排列的书",
        caption: "当天晚些时候的阅读空间。",
        location: "武雄",
      },
      {
        alt: "有田青山中的陶瓷鸟居与神社建筑",
        caption: "小镇上方的陶瓷鸟居。",
        location: "有田",
      },
      {
        alt: "有田街巷边的一处浓密绿荫",
        caption: "绿色从两边合向小路。",
        location: "有田",
      },
      {
        alt: "有田一处安静的倒影",
        caption: "最后留下的一小片静水。",
        location: "有田",
      },
    ],
    closing: "佐贺仍是一篇很短的笔记。两天里，武雄的铁轨与书、佐贺市的一条窄巷和有田的陶瓷表面被连在一起。",
  },
  "london-2024": {
    title: "英国，2024",
    subtitle: "伦敦 / 多佛 / 爱丁堡 / 剑桥 / 牛津",
    description: "八天，从伦敦湿街走到海边，再向北折返，经过两座大学城。",
    country: "英国",
    dates: "2024 年 4 月 27 日至 5 月 4 日",
    route: ["伦敦", "多佛", "爱丁堡", "剑桥", "牛津"],
    coverAlt: "夜色中横跨伦敦泰晤士河、亮起灯光的人行桥",
    intro:
      "路线从伦敦的雨开始，在多佛抵达英吉利海峡，随后向北去爱丁堡，再经剑桥和牛津折回。火车连接这些城市，照片里的石墙、湿街和偶尔展开的绿地也一路相接。",
    chapters: [
      {
        title: "站台、雨和河上的灯",
        place: "伦敦",
        paragraphs: [
          "伦敦从夜里的火车站台开始。后面几张跟着雨伞穿过湿街，等河岸的灯亮起，才走到泰晤士河边。",
          "城市被这些地点之间的移动连在一起。铁轨、路面和桥索各自在照片上画出一条路线。",
        ],
        frame: {
          alt: "亮起灯光的人行桥与倒映在泰晤士河里的城市灯火",
          caption: "天黑以后的过河路。",
          location: "伦敦",
        },
      },
      {
        title: "英吉利海峡边缘",
        place: "多佛",
        paragraphs: [
          "多佛把行程打开到海风和远处。两个人站在悬崖边，面对一直延伸到地平线的蓝色水面。",
          "离开伦敦紧密的街道，竖幅里只剩草地、白崖、海和两道背影。",
        ],
        frame: {
          alt: "两人站在多佛悬崖上眺望大海",
          caption: "隔着海峡望向远处。",
          location: "多佛",
        },
      },
      {
        title: "雨后的石头",
        place: "爱丁堡",
        paragraphs: [
          "爱丁堡先在夜里出现。车流穿过雨水打暗的街道，两边都是旧建筑。到了白天，倒影换成路牌和厚重石墙。",
          "两张照片都压着相近的颜色。砖石、道路标线和街道坡度已经替城市搭好结构。",
        ],
        frame: {
          alt: "车辆夜间驶过爱丁堡湿润街道",
          caption: "被雨水压暗的夜间车流。",
          location: "爱丁堡",
        },
      },
      {
        title: "越过草地",
        place: "剑桥",
        paragraphs: [
          "剑桥从一片开阔草地对面出现。哥特式石楼立在远处，一辆小型作业车正从中间经过。",
          "维护校园的日常工作也被留在明信片一样的风景里。旧建筑和眼前的劳动共用这个安静早晨。",
        ],
        frame: {
          alt: "剑桥绿色草地远处的哥特式学院建筑",
          caption: "作业草地后面的学院天际线。",
          location: "剑桥",
        },
      },
      {
        title: "石墙与空地",
        place: "牛津",
        paragraphs: [
          "牛津用两种重量给路线收尾。一张被雕刻石墙填满，下一张只有三棵大树立在绿色坡地上。",
          "最后的选片让这两个画面留在一起。建筑存下长期劳作的痕迹，空地给返程火车以前的行程留了一口气。",
        ],
        frame: {
          alt: "牛津学院建筑上的哥特式石雕",
          caption: "一面由细节搭成的墙。",
          location: "牛津",
        },
      },
    ],
    frames: [
      {
        alt: "夜晚灯光下空旷的伦敦火车站台",
        caption: "等这组照片里的第一班车。",
        location: "伦敦",
      },
      {
        alt: "两人共撑一把伞走过伦敦湿街",
        caption: "走过雨里的伦敦。",
        location: "伦敦",
      },
      {
        alt: "伦敦夜空里的桥索与灯光",
        caption: "泰晤士河上方的线条。",
        location: "伦敦",
      },
      {
        alt: "爱丁堡旧石墙旁的一块路牌",
        caption: "贴着石墙给出的方向。",
        location: "爱丁堡",
      },
      {
        alt: "牛津绿色坡地上的三棵大树",
        caption: "路线尽头的空地。",
        location: "牛津",
      },
    ],
    closing: "最后一张是牛津坡地上的三棵树。经过一周的站台、石墙和湿街，路线在一片空地上结束。",
  },
};

export const localizeJourney = (
  journey: JourneyMeta,
  locale: SiteLocale,
): JourneyMeta => {
  if (locale !== "zh-CN") return journey;
  const translation = completedJourneyTranslations[journey.slug];
  if (!translation) return journey;

  const chapters = translation.chapters.map((chapter, index) => {
    const source = journey.chapters[index];
    if (!source) return chapter as JourneyChapter;

    return {
      ...source,
      ...chapter,
      frame:
        source.frame && chapter.frame
          ? { ...source.frame, ...chapter.frame }
          : source.frame,
    };
  });
  const frames = translation.frames.map((frame, index) => ({
    ...journey.frames[index],
    ...frame,
  })) as JourneyFrame[];

  return { ...journey, ...translation, chapters, frames };
};
