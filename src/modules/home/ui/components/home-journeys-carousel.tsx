"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import { journeys } from "@/modules/journeys/data/journeys";
import {
  localizeJourney,
  useSiteLocale,
} from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

const homeJourneyCovers = {
  "newzealand-2026": {
    src: "https://cdn.ytools.xyz/photos/DJI_20260427094951_0242_D-1778337584111.jpg",
    alt: {
      en: "A road following the mountain shore of Lake Wakatipu in New Zealand",
      "zh-CN": "新西兰瓦卡蒂普湖畔蜿蜒的山路",
    },
  },
  "uzbekistan-2026": {
    src: "https://cdn.ytools.xyz/photos/DSC00614-1771667465746.jpg",
    alt: {
      en: "The ornate interior of a historic building in Samarkand",
      "zh-CN": "撒马尔罕历史建筑内华丽的穹顶与纹饰",
    },
  },
  "norway-2025": {
    src: "https://cdn.ytools.xyz/photos/C9884F12-91DB-41CB-98BC-ED10F7988041-1759828372723.JPG",
    alt: {
      en: "A steep mountain rising behind red fishing cabins in Reine, Norway",
      "zh-CN": "挪威雷讷红色渔屋后升起的陡峭山峰",
    },
    objectPosition: "center 48%",
  },
  "iceland-2025": {
    src: "https://cdn.ytools.xyz/photos/a56af6d2ade2f278587b32d922431071-1759831612512.JPG",
    alt: {
      en: "A photographer in a red jacket crossing Iceland's volcanic landscape",
      "zh-CN": "穿红色外套的摄影者走过冰岛火山地貌",
    },
  },
  "japan-saga-2025": {
    src: "https://cdn.ytools.xyz/photos/DSC06738-1758261757210.JPG",
    alt: {
      en: "A warmly lit antique shop interior in Saga, Japan",
      "zh-CN": "日本佐贺一间灯光温暖的古董店内景",
    },
  },
  "london-2024": {
    src: "https://cdn.ytools.xyz/photos/DSC07021-1752421603428.JPG",
    alt: {
      en: "The illuminated Golden Jubilee Bridges over the Thames at night",
      "zh-CN": "夜色中横跨泰晤士河、亮起灯光的金禧桥",
    },
  },
} as const;

export const HomeJourneysCarousel = () => {
  const { copy, locale } = useSiteLocale();
  const localizedJourneys = journeys.map((journey) =>
    localizeJourney(journey, locale),
  );
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    loop: false,
    watchDrag: true,
  });
  const viewportNodeRef = useRef<HTMLDivElement | null>(null);
  const wheelGestureRef = useRef({
    delta: 0,
    moved: false,
    timer: 0,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(
    localizedJourneys.length > 1,
  );

  const updateSelection = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateSelection();
    emblaApi.on("select", updateSelection);
    emblaApi.on("reInit", updateSelection);

    return () => {
      emblaApi.off("select", updateSelection);
      emblaApi.off("reInit", updateSelection);
    };
  }, [emblaApi, updateSelection]);

  const setViewportNode = useCallback(
    (node: HTMLDivElement | null) => {
      viewportNodeRef.current = node;
      viewportRef(node);
    },
    [viewportRef],
  );

  useEffect(() => {
    const node = viewportNodeRef.current;
    if (!node || !emblaApi) return;

    const gesture = wheelGestureRef.current;
    const resetGesture = () => {
      gesture.delta = 0;
      gesture.moved = false;
      gesture.timer = 0;
    };
    const handleWheel = (event: WheelEvent) => {
      const isHorizontalGesture =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) &&
        Math.abs(event.deltaX) > 1;
      if (!isHorizontalGesture) return;

      event.preventDefault();
      window.clearTimeout(gesture.timer);
      gesture.timer = window.setTimeout(resetGesture, 180);
      gesture.delta += event.deltaX * (event.deltaMode === 1 ? 16 : 1);

      if (gesture.moved || Math.abs(gesture.delta) < 28) return;

      if (gesture.delta > 0) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollPrev();
      }
      gesture.moved = true;
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", handleWheel);
      window.clearTimeout(gesture.timer);
      resetGesture();
    };
  }, [emblaApi]);

  return (
    <div className={styles.homeJourneyCarousel}>
      <div className={styles.homeJourneyViewport} ref={setViewportNode}>
        <div className={styles.homeJourneyTrack}>
          {localizedJourneys.map((journey, index) => {
            const homeCover =
              homeJourneyCovers[
                journey.slug as keyof typeof homeJourneyCovers
              ];
            const coverImage = homeCover?.src ?? journey.coverImage;
            const coverAlt = homeCover?.alt[locale] ?? journey.coverAlt;

            return (
              <Link
                href={`/journeys/${journey.slug}`}
                className={`${styles.homeJourneySlide} ${
                  selectedIndex === index ? styles.homeJourneySlideActive : ""
                }`}
                key={journey.slug}
                aria-label={`${journey.title}, ${journey.dates}`}
              >
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={coverAlt}
                    fill
                    loader={getArchiveImageLoader(coverImage)}
                    sizes="(min-width: 900px) 72vw, 88vw"
                    className={styles.imageCover}
                    style={
                      homeCover && "objectPosition" in homeCover
                        ? { objectPosition: homeCover.objectPosition }
                        : undefined
                    }
                  />
                ) : (
                  <span
                    className={styles.homeJourneyPlaceholder}
                    role="img"
                    aria-label={coverAlt}
                  >
                    <small>{journey.countryCode}</small>
                    <strong>{copy.journeys.coverPending}</strong>
                  </span>
                )}
                <span className={styles.homeJourneyShade} aria-hidden="true" />

                <div className={styles.homeJourneyFrameMeta}>
                  <span>J{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    {journey.year}
                    {journey.draft ? ` / ${copy.journeys.draft}` : ""}
                  </span>
                </div>

                <div className={styles.homeJourneyCardCopy}>
                  <p>
                    {journey.country} · {journey.dates}
                  </p>
                  <h3>{journey.title}</h3>
                  <span>{journey.route.join(" — ")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className={styles.homeJourneyTimeline}>
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          aria-label={locale === "zh-CN" ? "上一段旅程" : "Previous journey"}
        >
          <ArrowLeft size={18} strokeWidth={1.35} />
        </button>

        <div
          className={styles.homeJourneyTimelineRail}
          role="tablist"
          aria-label={locale === "zh-CN" ? "旅程时间线" : "Journey timeline"}
        >
          {localizedJourneys.map((journey, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={selectedIndex === index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={
                selectedIndex === index ? styles.homeJourneyMomentActive : ""
              }
              key={journey.slug}
            >
              <span>{journey.year}</span>
              <i aria-hidden="true" />
              <strong>{journey.country}</strong>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          aria-label={locale === "zh-CN" ? "下一段旅程" : "Next journey"}
        >
          <ArrowRight size={18} strokeWidth={1.35} />
        </button>
      </div>

      <Link href="/journeys" className={styles.homeJourneyArchiveLink}>
        {copy.home.journeysLink}
        <ArrowUpRight size={15} strokeWidth={1.4} />
      </Link>
    </div>
  );
};
