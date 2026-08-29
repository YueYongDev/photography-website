"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import type { CSSProperties } from "react";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

export type HomeSelectedPhoto = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  blurData: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
};

const PHOTOS_PER_GROUP = 3;

const getOrientationClass = (aspectRatio: number) => {
  if (aspectRatio < 0.96) return styles.homeWorkCardPortrait;
  if (aspectRatio <= 1.08) return styles.homeWorkCardSquare;
  return styles.homeWorkCardLandscape;
};

const getAspectRatio = (photo: HomeSelectedPhoto) =>
  photo.width && photo.height
    ? photo.width / photo.height
    : photo.aspectRatio && photo.aspectRatio > 0
      ? photo.aspectRatio
      : 1.18;

const getGroupMaxWidth = (aspectRatios: number[]) => {
  const totalAspectRatio = aspectRatios.reduce(
    (total, aspectRatio) => total + aspectRatio,
    0,
  );
  const totalGapRem = Math.max(0, aspectRatios.length - 1);

  return `${Math.min(104, totalAspectRatio * 32 + totalGapRem)}rem`;
};

const groupPhotos = (photos: HomeSelectedPhoto[]) => {
  const groups: HomeSelectedPhoto[][] = [];

  for (let index = 0; index < photos.length; index += PHOTOS_PER_GROUP) {
    groups.push(photos.slice(index, index + PHOTOS_PER_GROUP));
  }

  return groups;
};

export const HomeSelectedCarousel = ({
  photos,
}: {
  photos: HomeSelectedPhoto[];
}) => {
  const { copy, locale } = useSiteLocale();
  const groups = useMemo(() => groupPhotos(photos), [photos]);
  const autoplay = useRef(
    Autoplay({
      delay: 6500,
      playOnInit: false,
      stopOnFocusIn: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  const [viewportRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      duration: 34,
      loop: groups.length > 1,
      watchDrag: groups.length > 1,
    },
    [autoplay.current],
  );
  useEffect(() => {
    if (!emblaApi || groups.length <= 1) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateAutoplay = () => {
      if (reducedMotion.matches) {
        autoplay.current.stop();
      } else {
        autoplay.current.play();
      }
    };

    updateAutoplay();
    reducedMotion.addEventListener("change", updateAutoplay);

    return () => {
      reducedMotion.removeEventListener("change", updateAutoplay);
      autoplay.current.stop();
    };
  }, [emblaApi, groups.length]);

  const previousLabel = locale === "zh-CN" ? "上一组照片" : "Previous group";
  const nextLabel = locale === "zh-CN" ? "下一组照片" : "Next group";
  const carouselLabel =
    locale === "zh-CN"
      ? `首页精选照片，共 ${groups.length} 组`
      : `Selected photographs, ${groups.length} groups`;

  return (
    <div
      className={styles.homeWorkCarousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselLabel}
    >
      <div className={styles.homeWorkViewport} ref={viewportRef}>
        <div className={styles.homeWorkTrack}>
          {groups.map((group, groupIndex) => {
            const aspectRatios = group.map(getAspectRatio);

            return (
              <div
                className={styles.homeWorkSlide}
                role="group"
                aria-roledescription="slide"
                aria-label={`${groupIndex + 1} / ${groups.length}`}
                key={group.map((photo) => photo.id).join("-")}
              >
                <div
                  className={styles.homeWorkGrid}
                  style={{
                    gridTemplateColumns: aspectRatios
                      .map((aspectRatio) => `${aspectRatio}fr`)
                      .join(" "),
                    maxWidth: getGroupMaxWidth(aspectRatios),
                  }}
                >
                  {group.map((entry, indexInGroup) => {
                    const photoIndex =
                      groupIndex * PHOTOS_PER_GROUP + indexInGroup;
                    const localizedEntry = copy.home.workEntries[photoIndex];
                    const title =
                      entry.title ||
                      localizedEntry?.title ||
                      copy.common.untitled;
                    const aspectRatio = aspectRatios[indexInGroup];
                    const cardStyle = {
                      "--home-work-narrow-width": `${Math.min(
                        48,
                        aspectRatio * 30,
                      )}rem`,
                    } as CSSProperties;

                    return (
                      <Link
                        href={`/photograph/${entry.id}`}
                        className={`${styles.homeWorkCard} ${getOrientationClass(aspectRatio)}`}
                        key={entry.id}
                        style={cardStyle}
                      >
                        <div
                          className={styles.homeWorkImage}
                          style={{ aspectRatio }}
                        >
                          <Image
                            src={entry.url}
                            alt={title}
                            fill
                            loader={getArchiveImageLoader(entry.url)}
                            placeholder={entry.blurData ? "blur" : "empty"}
                            blurDataURL={entry.blurData || undefined}
                            sizes="(min-width: 1101px) 34vw, 88vw"
                            className={styles.imageContain}
                          />
                        </div>
                        <div className={styles.homeWorkMeta}>
                          <span>{String(photoIndex + 1).padStart(2, "0")}</span>
                          <h3>{title}</h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {groups.length > 1 ? (
        <div className={styles.homeWorkPagination}>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={previousLabel}
          >
            <ArrowLeft size={16} strokeWidth={1.35} />
          </button>

          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={nextLabel}
          >
            <ArrowRight size={16} strokeWidth={1.35} />
          </button>
        </div>
      ) : null}
    </div>
  );
};
