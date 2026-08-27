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
    footerDescription: "Photographs / Journeys / Places",
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
    eyebrow: "HKG / 01",
    titleStart: "HONG KONG",
    titleEnd: "香港",
    heroAlt: "A red tram moving through a dense Hong Kong street",
    heroCaption: "Hong Kong / HKG",
    workEyebrow: "01 / Work",
    workTitle: "Selected Works",
    workLink: "View work",
    workEntries: [
      { title: "Untitled" },
      { title: "Untitled" },
      { title: "Untitled" },
    ],
    journeysEyebrow: "02 / Journeys",
    journeysTitle: "Journeys",
    journalMeta: "26 April · 02 May 2026",
    journalTitle: "New Zealand · 2026",
    travelEyebrow: "03 / Places",
    travelTitle: "Places",
    travelPrompt: "Countries",
  },
  work: {
    eyebrow: "01 / Work",
    titleStart: "SELECTED",
    titleEnd: "WORKS",
    selectedAlt: "Selected photograph",
    fieldStudy: "Location not recorded",
    emptyTitle: "No photographs selected",
  },
  journeys: {
    eyebrow: "02 / Journeys",
    titleStart: "JOURNEYS",
    titleEnd: "2026",
    read: "Open journey",
    readNote: "Open note",
    journeyLabel: "Journey",
    fieldNote: "Field note",
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
    eyebrow: "03 / Places",
    titleStart: "PLACES",
    titleEnd: "地点",
    countries: "Countries",
    cities: "Cities",
    cityMap: "City map",
    viewsLabel: "Travel views",
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
    eyebrow: "04 / Map",
    title: "MAP",
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
    title: "YUEYONG",
    paragraphOne:
      "Software engineer. I built this website and edit the photographs published here.",
    practice: "Photographs",
    practiceDescription: "Hong Kong, New Zealand, Australia, Uzbekistan.",
    tools: "Cameras",
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
    travel: "地点",
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
    footerDescription: "照片 / 旅程 / 地点",
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
    eyebrow: "HKG / 01",
    titleStart: "HONG KONG",
    titleEnd: "香港",
    heroAlt: "穿行在香港密集街道中的红色电车",
    heroCaption: "香港 / HKG",
    workEyebrow: "01 / 作品",
    workTitle: "SELECTED WORKS",
    workLink: "查看作品",
    workEntries: [
      { title: "无题" },
      { title: "无题" },
      { title: "无题" },
    ],
    journeysEyebrow: "02 / 旅程",
    journeysTitle: "JOURNEYS",
    journalMeta: "2026 年 4 月 26 日 · 5 月 2 日",
    journalTitle: "新西兰南岛 · 2026",
    travelEyebrow: "03 / 地点",
    travelTitle: "PLACES",
    travelPrompt: "国家",
  },
  work: {
    eyebrow: "01 / 作品",
    titleStart: "SELECTED",
    titleEnd: "WORKS",
    selectedAlt: "精选摄影作品",
    fieldStudy: "地点待补",
    emptyTitle: "暂无照片",
  },
  journeys: {
    eyebrow: "02 / 旅程",
    titleStart: "JOURNEYS",
    titleEnd: "2026",
    read: "查看旅程",
    readNote: "查看笔记",
    journeyLabel: "旅行记录",
    fieldNote: "路上笔记",
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
    eyebrow: "03 / 地点",
    titleStart: "PLACES",
    titleEnd: "地点",
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
    eyebrow: "04 / 地图",
    title: "MAP",
  },
  map: {
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
    title: "YUEYONG",
    paragraphOne: "软件工程师。网站是我自己写的，照片也是自己整理的。",
    practice: "照片",
    practiceDescription: "香港、新西兰、澳大利亚、乌兹别克斯坦。",
    tools: "相机",
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
    title: "新西兰南岛",
    subtitle: "皇后镇 / 奥拉基",
    description:
      "2026 年 4 月 26 日至 5 月 2 日，自驾从皇后镇前往奥拉基。",
    country: "新西兰",
    dates: "2026 年 4 月 26 日至 5 月 2 日",
    route: ["皇后镇", "格林诺奇", "瓦纳卡", "蒂卡普", "奥拉基"],
    coverAlt: "通往奥拉基 / 库克山的公路",
    intro: "全程自驾。",
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
};

export const localizeJourney = (
  journey: JourneyMeta,
  locale: SiteLocale,
): JourneyMeta => {
  if (locale !== "zh-CN") return journey;
  const translation = journeyTranslations[journey.slug];
  return translation ? { ...journey, ...translation } : journey;
};
