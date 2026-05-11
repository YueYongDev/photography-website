"use client";

import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  journeys as journeyMeta,
  type JourneyStatus,
} from "@/modules/journeys/data/journeys";

type FilmJourney = {
  slug: string;
  title: string;
  year: string;
  subtitle: string;
  description: string;
  status: JourneyStatus;
  startDate: string;
  endDate?: string;
  locations: string[];
  country: string;
  region: string;
  theme: string;
  frames: number;
  km: number;
  coverImage: string;
  href: string;
  featured: boolean;
  accent: string;
  coords: [number, number];
  exif: {
    iso: number;
    aperture: string;
    shutter: string;
    focal: string;
    wb: string;
  };
  gear: string[];
  fieldStatus: string;
};

type FilmTweaks = {
  accent: string;
  grain: number;
  aspect: string;
  stripPos: "top" | "bottom";
  showExif: boolean;
};

type FilmScrollState = {
  canLeft: boolean;
  canRight: boolean;
  remaining: number;
};

const bySlug = Object.fromEntries(
  journeyMeta.map((journey) => [journey.slug, journey]),
);

const cover = (slug: string) => bySlug[slug]?.coverImage ?? "";
const href = (slug: string) => bySlug[slug]?.href ?? `/journeys/${slug}`;

const formatCoordinate = (value: number, axis: "lat" | "lon") => {
  const suffix =
    axis === "lat" ? (value < 0 ? "S" : "N") : value < 0 ? "W" : "E";

  return `${Math.abs(value).toFixed(4)}° ${suffix}`;
};

const filmJourneys: FilmJourney[] = [
  {
    slug: "newzealand-2026",
    title: "New Zealand",
    year: "2026",
    subtitle: "Aotearoa Express",
    description:
      "Queenstown, Glenorchy, Wanaka, Tekapo and Aoraki / Mt Cook - a vintage bulletin from the South Island in autumn.",
    status: "live",
    startDate: "2026-04-26",
    endDate: "2026-05-02",
    locations: [
      "Queenstown",
      "Glenorchy",
      "Wanaka",
      "Tekapo",
      "Aoraki / Mt Cook",
    ],
    country: "New Zealand",
    region: "South Pacific",
    theme: "Autumn bulletin · Southern Alps · open road",
    frames: 7,
    km: 1184,
    coverImage: cover("newzealand-2026"),
    href: href("newzealand-2026"),
    featured: true,
    accent: "#C84E1F",
    coords: [170.5, -44.0],
    exif: {
      iso: 100,
      aperture: "f/1.8",
      shutter: "1/120",
      focal: "24mm",
      wb: "5200K",
    },
    gear: ["iPhone 17 Pro", "Sony A7R V", "Hyundai Tucson"],
    fieldStatus: "PUBLISHED · TEKAPO",
  },
  {
    slug: "uzbekistan-2026",
    title: "Uzbekistan",
    year: "2026",
    subtitle: "A Silk Road field notebook",
    description:
      "Tashkent, Bukhara and Samarkand. Tiled mosques, indigo domes, and the slow hum of the old caravan roads - shot in deep winter light.",
    status: "live",
    startDate: "2026-02-17",
    endDate: "2026-02-24",
    locations: ["Tashkent", "Bukhara", "Samarkand"],
    country: "Uzbekistan",
    region: "Central Asia",
    theme: "Silk Road blue · winter gold · field notes",
    frames: 412,
    km: 1840,
    coverImage: cover("uzbekistan-2026"),
    href: href("uzbekistan-2026"),
    featured: true,
    accent: "#C8894A",
    coords: [64.5, 40.5],
    exif: {
      iso: 200,
      aperture: "f/2.8",
      shutter: "1/250",
      focal: "35mm",
      wb: "5400K",
    },
    gear: ["Leica M11", "Summicron 35/2 APO", "Summilux 50/1.4"],
    fieldStatus: "IN FIELD · BUKHARA",
  },
  {
    slug: "saga-2025",
    title: "Saga",
    year: "2025",
    subtitle: "Along the edge of the world",
    description:
      "Remote coastlines and ancient landscapes. A journey tracing the grey edges of the known world - mist, stone, open sea.",
    status: "planning",
    startDate: "2025-07-10",
    endDate: "2025-07-20",
    locations: ["TBD"],
    country: "Japan",
    region: "East Asia",
    theme: "Mist · stone · open sea",
    frames: 0,
    km: 0,
    coverImage: cover("saga-2025"),
    href: href("saga-2025"),
    featured: false,
    accent: "#6E7F86",
    coords: [130.3, 33.2],
    exif: {
      iso: 400,
      aperture: "f/4",
      shutter: "1/125",
      focal: "28mm",
      wb: "6000K",
    },
    gear: ["Fujifilm X-T5", "XF 16-55/2.8"],
    fieldStatus: "PLANNING",
  },
  {
    slug: "turkiye-2025",
    title: "Türkiye",
    year: "2025",
    subtitle: "Between two continents",
    description:
      "Istanbul, Cappadocia and the Aegean. Ancient architecture, balloons at dawn, and the Bosphorus at dusk.",
    status: "planning",
    startDate: "2025-09-05",
    endDate: "2025-09-15",
    locations: ["Istanbul", "Cappadocia", "Bodrum"],
    country: "Türkiye",
    region: "West Asia",
    theme: "Terracotta · turquoise · Ottoman mosaic",
    frames: 0,
    km: 0,
    coverImage: cover("turkiye-2025"),
    href: href("turkiye-2025"),
    featured: false,
    accent: "#B56A3E",
    coords: [32.9, 39.1],
    exif: {
      iso: 100,
      aperture: "f/5.6",
      shutter: "1/500",
      focal: "50mm",
      wb: "5200K",
    },
    gear: ["Sony A7R V", "24-70 GM II"],
    fieldStatus: "PLANNING",
  },
  {
    slug: "iceland-2025",
    title: "Iceland",
    year: "2025",
    subtitle: "Fire, ice, long exposure nights",
    description:
      "Chasing aurora across Reykjavík, Vík and Snæfellsnes - a week of volcanic landscapes and midnight skies.",
    status: "planning",
    startDate: "2025-10-03",
    endDate: "2025-10-10",
    locations: ["Reykjavík", "Vík í Mýrdal", "Snæfellsnes"],
    country: "Iceland",
    region: "North Atlantic",
    theme: "Glacial grey · aurora green · long exposure",
    frames: 0,
    km: 0,
    coverImage: cover("iceland-2025"),
    href: href("iceland-2025"),
    featured: false,
    accent: "#6B8A95",
    coords: [-19.0, 64.9],
    exif: {
      iso: 800,
      aperture: "f/2.0",
      shutter: "30s",
      focal: "20mm",
      wb: "3800K",
    },
    gear: ["Nikon Z8", "20mm f/1.8 S", "tripod"],
    fieldStatus: "PLANNING",
  },
  {
    slug: "norway-2025",
    title: "Norway",
    year: "2025",
    subtitle: "Fjords and silence",
    description:
      "Flåm, Geiranger and Lofoten - a slow drive through winter light at the edge of the Arctic.",
    status: "planning",
    startDate: "2025-11-18",
    endDate: "2025-11-27",
    locations: ["Flåm", "Geiranger", "Lofoten"],
    country: "Norway",
    region: "Scandinavia",
    theme: "Steel blue · snow white · fjord grey",
    frames: 0,
    km: 0,
    coverImage: cover("norway-2025"),
    href: href("norway-2025"),
    featured: false,
    accent: "#7A8E9E",
    coords: [8.5, 64.0],
    exif: {
      iso: 320,
      aperture: "f/4",
      shutter: "1/160",
      focal: "24mm",
      wb: "5800K",
    },
    gear: ["Leica Q3", "Rode VideoMicro"],
    fieldStatus: "PLANNING",
  },
];

const filmTweaks: FilmTweaks = {
  accent: "#C8894A",
  grain: 0.4,
  aspect: "16/9",
  stripPos: "bottom",
  showExif: true,
};

const formatRange = (start: string, end?: string) => {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startLabel = formatter.format(new Date(`${start}T00:00:00`));

  if (!end) return startLabel;

  return `${startLabel} - ${formatter.format(new Date(`${end}T00:00:00`))}`;
};

const daysUntil = (date: string) => {
  const now = new Date();
  const target = new Date(`${date}T00:00:00`);
  const ms = target.getTime() - now.getTime();

  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const totals = (journeys: FilmJourney[]) => {
  const countries = new Set(journeys.map((journey) => journey.country));
  const frames = journeys.reduce((sum, journey) => sum + journey.frames, 0);
  const km = journeys.reduce((sum, journey) => sum + journey.km, 0);
  const live = journeys.filter((journey) => journey.status === "live").length;
  const planning = journeys.filter(
    (journey) => journey.status === "planning",
  ).length;

  return {
    countries: countries.size,
    frames,
    km,
    live,
    planning,
    total: journeys.length,
  };
};

const groupByYear = (list: FilmJourney[]) => {
  const grouped = list.reduce<Record<string, FilmJourney[]>>((map, journey) => {
    map[journey.year] = map[journey.year] ?? [];
    map[journey.year].push(journey);

    return map;
  }, {});

  return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
};

const useTick = (period = 1000) => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTime(Date.now()), period);

    return () => window.clearInterval(id);
  }, [period]);

  return time;
};

const CornerBracket = ({
  className = "",
  rot = 0,
}: {
  className?: string;
  rot?: number;
}) => (
  <div
    className={`absolute z-20 ${className}`}
    style={{ transform: `rotate(${rot}deg)` }}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="opacity-60"
      aria-hidden="true"
    >
      <path d="M2 8 V2 H8" />
    </svg>
  </div>
);

const StripTop = ({
  tweaks,
  journeys,
  idx,
  setIdx,
}: {
  tweaks: FilmTweaks;
  journeys: FilmJourney[];
  idx: number;
  setIdx: Dispatch<SetStateAction<number>>;
}) => (
  <div className="border-b border-white/10 bg-[#0a0a0a] py-3">
    <div className="sprocket h-2 opacity-40" />
    <div className="cc flex items-center gap-3 overflow-x-auto px-6 py-2 sm:px-10">
      {journeys.map((journey, index) => (
        <button
          key={journey.slug}
          type="button"
          onClick={() => setIdx(index)}
          className="group shrink-0 text-left"
        >
          <div
            className={`relative h-[72px] w-[120px] overflow-hidden transition ${
              index === idx
                ? ""
                : "opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
            }`}
            style={
              index === idx
                ? { boxShadow: `0 0 0 2px ${tweaks.accent}` }
                : undefined
            }
          >
            <img
              src={journey.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </button>
      ))}
    </div>
    <div className="sprocket h-2 opacity-40" />
  </div>
);

const FilmHero = ({
  tweaks,
  idx,
  setIdx,
  journeys,
}: {
  tweaks: FilmTweaks;
  idx: number;
  setIdx: Dispatch<SetStateAction<number>>;
  journeys: FilmJourney[];
}) => {
  const accent = tweaks.accent;
  const cur = journeys[idx];
  const prevRef = useRef(cur);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [fading, setFading] = useState(false);
  const [scroll, setScroll] = useState<FilmScrollState>({
    canLeft: false,
    canRight: false,
    remaining: 0,
  });
  const [yearFilter, setYearFilter] = useState("all");
  const years = Array.from(new Set(journeys.map((journey) => journey.year))).sort(
    (a, b) => b.localeCompare(a),
  );
  const visibleJourneys =
    yearFilter === "all"
      ? journeys
      : journeys.filter((journey) => journey.year === yearFilter);

  useEffect(() => {
    if (prevRef.current.slug === cur.slug) return;

    setFading(true);
    const timeout = window.setTimeout(() => {
      prevRef.current = cur;
      setFading(false);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [cur]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        return;
      }

      if (event.key === "ArrowRight") {
        setIdx((index) => (index + 1) % journeys.length);
      }

      if (event.key === "ArrowLeft") {
        setIdx((index) => (index - 1 + journeys.length) % journeys.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [journeys.length, setIdx]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const active = strip.querySelector<HTMLElement>(`[data-slug="${cur.slug}"]`);
    if (!active) return;

    const nextLeft =
      active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;

    strip.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: "smooth",
    });
  }, [cur.slug]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const update = () => {
      const canLeft = strip.scrollLeft > 4;
      const canRight =
        strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 4;
      const remainingPx =
        strip.scrollWidth - (strip.scrollLeft + strip.clientWidth);
      const remaining = Math.max(0, Math.round(remainingPx / 195));

      setScroll({ canLeft, canRight, remaining });
    };

    update();
    strip.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(strip);

    return () => {
      strip.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [visibleJourneys.length]);

  const nudge = (dir: -1 | 1) => {
    const strip = stripRef.current;
    if (!strip) return;

    strip.scrollBy({
      left: dir * Math.round(strip.clientWidth * 0.7),
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      <div
        className="journeys-hero-stage relative w-full pt-24 md:pt-8"
        style={{ "--journey-aspect": tweaks.aspect } as React.CSSProperties}
      >
        <img
          src={prevRef.current.coverImage}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            fading ? "opacity-100" : "opacity-0"
          }`}
        />
        <img
          key={cur.slug}
          src={cur.coverImage}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-transparent" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 0 0 240px 60px rgba(0,0,0,0.75)",
          }}
        />
        <div
          className="noise-film pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{ opacity: tweaks.grain }}
        />

        {tweaks.showExif ? (
          <div className="absolute left-5 right-5 top-16 z-10 hidden items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/75 md:flex lg:left-10 lg:right-10 lg:top-20">
            <div className="flex items-center gap-5">
              <span>{cur.exif.focal}</span>
              <span className="opacity-40">·</span>
              <span>ISO {cur.exif.iso}</span>
              <span className="opacity-40">·</span>
              <span>{cur.exif.aperture}</span>
              <span className="opacity-40">·</span>
              <span>{cur.exif.shutter}</span>
              <span className="opacity-40">·</span>
              <span>WB {cur.exif.wb}</span>
            </div>
            <div className="flex items-center gap-5">
              <span>{formatCoordinate(cur.coords[1], "lat")}</span>
              <span>{formatCoordinate(cur.coords[0], "lon")}</span>
              <span className="opacity-40">·</span>
              <span>{cur.country}</span>
            </div>
          </div>
        ) : null}

        <CornerBracket className="left-5 top-24 lg:left-10 lg:top-28" />
        <CornerBracket className="right-5 top-24 lg:right-10 lg:top-28" rot={90} />
        <CornerBracket
          className="bottom-24 left-5 lg:bottom-28 lg:left-10"
          rot={-90}
        />
        <CornerBracket
          className="bottom-24 right-5 lg:bottom-28 lg:right-10"
          rot={180}
        />

        <div className="absolute inset-x-5 bottom-24 z-10 lg:inset-x-10 lg:bottom-28">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="max-w-3xl">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--journey-accent)]">
                {cur.theme}
              </div>
              <div
                className="font-display text-[56px] italic leading-[0.82] tracking-[-0.02em] min-[430px]:text-[62px] sm:text-[96px] lg:text-[140px]"
                style={{ fontWeight: 500 }}
              >
                {cur.title}
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-5">
                <span className="tick font-mono text-xl opacity-80 lg:text-2xl">
                  {cur.year}
                </span>
                <span className="opacity-40">-</span>
                <span className="font-serif-it text-2xl italic opacity-95 lg:text-3xl">
                  {cur.subtitle}
                </span>
              </div>
            </div>

            <div className="hidden w-[280px] shrink-0 border-l border-white/20 pb-2 pl-6 lg:block">
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/50">
                frame 001 / {cur.frames || "000"}
              </div>
              <p className="text-[14px] leading-6 text-white/80">
                {cur.description}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-8 z-10 flex items-center justify-between lg:inset-x-10 lg:bottom-10">
          <div className="flex items-center gap-5">
            {cur.status === "live" ? (
              <a
                href={cur.href}
                className="group inline-flex items-center gap-3 border-y border-white/30 py-3 pr-8 transition hover:border-white"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.24em]">
                  Open the reel
                </span>
                <span className="text-[var(--journey-accent)]">↗</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-5 border-y border-white/30 py-3 pr-2">
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] opacity-60 sm:inline">
                  next in production
                </span>
                <span className="tick font-display text-3xl italic text-[var(--journey-accent)]">
                  T-{daysUntil(cur.startDate)}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-60">
                  days
                </span>
              </div>
            )}
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={() =>
                setIdx((index) => (index - 1 + journeys.length) % journeys.length)
              }
              className="flex size-11 items-center justify-center rounded-full border border-white/30 transition hover:border-white hover:bg-white/10"
              aria-label="Previous journey"
            >
              ←
            </button>
            <div className="w-20 text-center font-mono text-[10px] uppercase tracking-[0.22em] opacity-60">
              {cur.title}
            </div>
            <button
              type="button"
              onClick={() => setIdx((index) => (index + 1) % journeys.length)}
              className="flex size-11 items-center justify-center rounded-full border border-white/30 transition hover:border-white hover:bg-white/10"
              aria-label="Next journey"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {years.length > 1 ? (
        <div className="cc flex items-center gap-3 overflow-x-auto border-y border-white/10 bg-black/90 px-5 py-3 sm:px-10">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] opacity-50">
            year
          </span>
          <button
            type="button"
            onClick={() => setYearFilter("all")}
            className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition ${
              yearFilter === "all"
                ? "border-white bg-white text-black"
                : "border-white/20 hover:border-white/60"
            }`}
          >
            all · {journeys.length}
          </button>
          {years.map((year) => {
            const count = journeys.filter((journey) => journey.year === year).length;

            return (
              <button
                key={year}
                type="button"
                onClick={() => setYearFilter(year)}
                className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] transition ${
                  yearFilter === year
                    ? "border-white bg-white text-black"
                    : "border-white/20 hover:border-white/60"
                }`}
              >
                {year} · {count}
              </button>
            );
          })}
          <div className="flex-1" />
          <div className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] opacity-50 sm:block">
            ← → to scrub
          </div>
        </div>
      ) : null}

      <div className="relative bg-[#0a0a0a] py-4">
        <div className="sprocket h-3 opacity-40" />
        <div
          ref={stripRef}
          className="cc flex scroll-smooth items-end gap-5 overflow-x-auto px-5 py-5 sm:px-10"
        >
          {groupByYear(visibleJourneys).map(([year, items]) => (
            <div key={year} className="relative shrink-0">
              <div
                className="font-display pointer-events-none absolute -top-8 left-2 text-5xl italic opacity-20"
                style={{ fontWeight: 500 }}
              >
                {year}
              </div>
              <div className="flex items-end gap-3 pt-5">
                {items.map((journey) => {
                  const index = journeys.indexOf(journey);
                  const isSelected = index === idx;

                  return (
                    <button
                      key={journey.slug}
                      type="button"
                      data-slug={journey.slug}
                      onClick={() => setIdx(index)}
                      className="group shrink-0 text-left"
                    >
                      <div
                        className={`relative h-[110px] w-[180px] overflow-hidden transition ${
                          isSelected
                            ? ""
                            : "opacity-55 grayscale hover:opacity-100 hover:grayscale-0"
                        }`}
                        style={
                          isSelected
                            ? { boxShadow: `0 0 0 2px ${accent}` }
                            : undefined
                        }
                      >
                        <img
                          src={journey.coverImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute left-1 top-1 bg-black/70 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.2em]">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        {journey.status === "live" ? (
                          <div className="absolute bottom-1 right-1 bg-[var(--journey-accent)] px-1.5 py-0.5 font-mono text-[8px] tracking-[0.2em] text-black">
                            OPEN
                          </div>
                        ) : null}
                        {journey.status !== "live" &&
                        journey.status !== "archived" ? (
                          <div className="absolute bottom-1 right-1 bg-amber-500/80 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.2em] text-black">
                            SOON
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
                        {journey.title} · {journey.year}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="sprocket h-3 opacity-40" />

        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-32 transition-opacity duration-300 ${
            scroll.canLeft ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(to right, #0a0a0a 15%, rgba(10,10,10,0) 100%)",
          }}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-40 transition-opacity duration-300 ${
            scroll.canRight ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(to left, #0a0a0a 15%, rgba(10,10,10,0) 100%)",
          }}
        />

        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Scroll filmstrip left"
          className={`absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/60 backdrop-blur transition hover:border-white/70 hover:bg-black/90 ${
            scroll.canLeft ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <path d="M15 18L9 12l6-6" />
          </svg>
        </button>

        <div
          className={`absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-3 transition ${
            scroll.canRight ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="nudge-right hidden items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 backdrop-blur md:flex"
            style={{
              boxShadow: `0 0 0 1px ${accent}22, 0 6px 24px rgba(0,0,0,.5)`,
            }}
          >
            <span className="text-[var(--journey-accent)]">
              +{scroll.remaining || "..."}
            </span>
            <span className="opacity-70">more reels</span>
            <span className="text-white/40">→</span>
          </div>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Scroll filmstrip right"
            className="flex size-11 items-center justify-center rounded-full border bg-black/70 backdrop-blur transition hover:bg-black"
            style={{
              borderColor: accent,
              color: accent,
              boxShadow: `0 0 24px ${accent}33`,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative h-1 bg-white/10">
        <div
          className="absolute bottom-0 left-0 top-0 bg-[var(--journey-accent)] transition-[width] duration-500"
          style={{ width: `${((idx + 1) / journeys.length) * 100}%` }}
        />
      </div>
    </section>
  );
};

const FieldTicker = ({
  tweaks,
  journeys,
}: {
  tweaks: FilmTweaks;
  journeys: FilmJourney[];
}) => {
  const time = useTick(1000);
  const liveOne = journeys.find((journey) => journey.status === "live") ?? journeys[0];
  const now = new Date(time);
  const timeLabel =
    now.toISOString().replace("T", " · ").slice(0, 19) + " UTC";
  const items = [
    `IN FIELD · ${liveOne.country.toUpperCase()}`,
    `${liveOne.coords[1].toFixed(4)}° N / ${liveOne.coords[0].toFixed(4)}° E`,
    "FRAME 412 / 000",
    `${liveOne.exif.focal} · ${liveOne.exif.aperture} · ${liveOne.exif.shutter}`,
    `ROLL 03 · ${liveOne.locations.join(" → ")}`,
    timeLabel,
    "FILE DSC00614.DNG",
    "BATTERY 72%",
  ];
  const repeated = [...items, ...items, ...items];

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black text-white">
      <div className="cc flex items-center gap-3 overflow-x-auto whitespace-nowrap border-b border-white/10 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.28em]">
        <span
          className="size-2 shrink-0 animate-pulse rounded-full"
          style={{ background: tweaks.accent }}
        />
        <span className="shrink-0">Live Feed</span>
        <span className="shrink-0 opacity-50">
          · broadcasting from {liveOne.title}
        </span>
        <span className="flex-1" />
        <span className="hidden shrink-0 opacity-60 sm:inline">
          auto · refresh 1s
        </span>
      </div>
      <div className="relative overflow-hidden py-5">
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{ animation: "journeys-marq 55s linear infinite" }}
        >
          {repeated.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 font-mono text-[13px] uppercase tracking-[0.24em]"
            >
              <span
                style={{
                  color: index % 3 === 0 ? tweaks.accent : undefined,
                }}
              >
                {item}
              </span>
              <span className="opacity-30">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const JourneyIndex = ({
  tweaks,
  journeys,
  setIdx,
}: {
  tweaks: FilmTweaks;
  journeys: FilmJourney[];
  setIdx: Dispatch<SetStateAction<number>>;
}) => {
  const total = totals(journeys);

  return (
    <section className="relative bg-black px-5 py-16 text-white sm:px-10">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] opacity-60">
            Index
          </div>
          <h2
            className="font-display mt-2 text-4xl italic"
            style={{ fontWeight: 500 }}
          >
            All reels <span className="opacity-50">· {total.total}</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.24em] opacity-60">
          <span>
            <span style={{ color: tweaks.accent }}>{total.live}</span> open
          </span>
          <span className="opacity-30">·</span>
          <span>{total.planning} in production</span>
          <span className="opacity-30">·</span>
          <span>{total.countries} countries</span>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {journeys.map((journey, index) => {
          const isLive = journey.status === "live";
          const row = (
            <>
              <div className="font-mono text-sm opacity-50 md:col-span-1">
                №{String(index + 1).padStart(2, "0")}
              </div>
              <div className="noise-film relative aspect-[3/2] overflow-hidden md:col-span-2">
                <img
                  src={journey.coverImage}
                  alt=""
                  className={`h-full w-full object-cover transition duration-700 ${
                    isLive
                      ? "group-hover:scale-105"
                      : "grayscale opacity-60"
                  }`}
                />
                <div className="noise-film absolute inset-0 opacity-20 mix-blend-overlay" />
              </div>
              <div className="md:col-span-4">
                <div
                  className="font-display text-3xl italic leading-none"
                  style={{ fontWeight: 500 }}
                >
                  {journey.title}{" "}
                  <span className="text-xl opacity-50">{journey.year}</span>
                </div>
                <div className="font-serif-it mt-1 text-base italic opacity-75">
                  {journey.subtitle}
                </div>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60 md:col-span-3">
                {journey.locations.slice(0, 3).join(" · ")}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70 md:col-span-1">
                {isLive ? (
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: tweaks.accent }}
                  >
                    <span
                      className="size-1.5 animate-pulse rounded-full"
                      style={{ background: tweaks.accent }}
                    />{" "}
                    open
                  </span>
                ) : (
                  <span>T-{daysUntil(journey.startDate)}d</span>
                )}
              </div>
              <div className="text-right font-mono text-lg md:col-span-1">
                {isLive ? (
                  <span style={{ color: tweaks.accent }}>↗</span>
                ) : (
                  <span className="opacity-30">-</span>
                )}
              </div>
            </>
          );
          const className = `group grid items-center gap-6 py-5 transition md:grid-cols-12 ${
            isLive ? "cursor-pointer hover:bg-white/5" : "cursor-default"
          }`;

          if (isLive) {
            return (
              <a
                key={journey.slug}
                href={journey.href}
                onMouseEnter={() => setIdx(index)}
                className={className}
              >
                {row}
              </a>
            );
          }

          return (
            <div
              key={journey.slug}
              onMouseEnter={() => setIdx(index)}
              className={className}
            >
              {row}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const JourneysStyles = () => (
  <style jsx global>{`
    @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,500,50,1&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap");

    .journeys-film {
      --journey-accent: #c8894a;
      background: #000;
      color: #f4f3ee;
      font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
    }

    .journeys-film .font-display {
      font-family: "Fraunces", ui-serif, Georgia, serif;
      font-optical-sizing: auto;
    }

    .journeys-film .font-serif-it {
      font-family: "Instrument Serif", serif;
    }

    .journeys-film .font-mono {
      font-family: "JetBrains Mono", ui-monospace, monospace;
    }

    .journeys-film .tick {
      font-variant-numeric: tabular-nums;
    }

    .journeys-film .journeys-hero-stage {
      min-height: min(720px, calc(100svh - 24px));
    }

    @media (min-width: 768px) {
      .journeys-film .journeys-hero-stage {
        min-height: 0;
        aspect-ratio: var(--journey-aspect);
      }
    }

    .journeys-film .noise-film {
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    }

    .journeys-film .sprocket {
      background-color: #111;
      background-image: radial-gradient(#0a0a0a 42%, transparent 44%);
      background-repeat: repeat-x;
      background-size: 40px 40px;
    }

    .journeys-film .cc {
      scrollbar-width: thin;
    }

    .journeys-film .cc::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    .journeys-film .cc::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    @keyframes journeys-marq {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-33.333%);
      }
    }

    @keyframes journeys-nudge-right {
      0%,
      100% {
        transform: translateX(0);
      }
      50% {
        transform: translateX(6px);
      }
    }

    .journeys-film .nudge-right {
      animation: journeys-nudge-right 1.6s ease-in-out infinite;
    }

    body:has(.journeys-film) header {
      position: absolute !important;
    }

    @media (max-width: 1023px) {
      body:has(.journeys-film) header {
        top: 12px !important;
        right: 12px !important;
        left: 12px !important;
        width: auto !important;
        background: transparent !important;
        pointer-events: none;
      }

      body:has(.journeys-film) header > div:first-child,
      body:has(.journeys-film) header > button {
        background: hsl(var(--background));
        pointer-events: auto;
      }

      body:has(.journeys-film) header > div:first-child {
        width: max-content;
        border-bottom-right-radius: 18px;
      }

      body:has(.journeys-film) header > button.fixed {
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
      }

      body:has(.journeys-film) header > div:first-child > div.fixed {
        position: absolute !important;
        top: -12px !important;
        left: -12px !important;
      }
    }
  `}</style>
);

export const JourneysView = () => {
  const [idx, setIdx] = useState(
    Math.max(
      0,
      filmJourneys.findIndex((journey) => journey.status === "live"),
    ),
  );

  return (
    <>
      <JourneysStyles />
      <div
        className="journeys-film min-h-screen overflow-hidden rounded-xl rounded-tl-none"
        style={{ "--journey-accent": filmTweaks.accent } as React.CSSProperties}
      >
        {filmTweaks.stripPos === "top" ? (
          <StripTop
            tweaks={filmTweaks}
            journeys={filmJourneys}
            idx={idx}
            setIdx={setIdx}
          />
        ) : null}
        <FilmHero
          tweaks={filmTweaks}
          idx={idx}
          setIdx={setIdx}
          journeys={filmJourneys}
        />
        <FieldTicker tweaks={filmTweaks} journeys={filmJourneys} />
        <JourneyIndex
          tweaks={filmTweaks}
          journeys={filmJourneys}
          setIdx={setIdx}
        />
      </div>
    </>
  );
};
