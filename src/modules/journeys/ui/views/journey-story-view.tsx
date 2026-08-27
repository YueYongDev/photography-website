"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import type { PublicJourneyStory } from "@/modules/journeys/types";
import { useSiteLocale } from "@/modules/site/i18n/site-locale";
import styles from "@/modules/site/ui/public-site.module.css";

const markdownComponents: Components = {
  img: ({ src, alt }) => {
    if (!src) return null;

    return (
      <span className={styles.storyInlineImage}>
        <Image
          src={src}
          alt={alt || ""}
          width={1600}
          height={1067}
          loader={getArchiveImageLoader(src)}
          sizes="(min-width: 900px) 64vw, 92vw"
        />
      </span>
    );
  },
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

export const JourneyStoryView = ({ story }: { story: PublicJourneyStory }) => {
  const { copy, locale } = useSiteLocale();
  const updatedAt = new Intl.DateTimeFormat(
    locale === "zh-CN" ? "zh-CN" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  ).format(new Date(story.updatedAt));

  return (
    <article className={styles.storyDetail}>
      <header className={styles.storyHeader}>
        <Link href="/journeys" className={styles.journeyBack}>
          <ArrowLeft size={15} strokeWidth={1.4} /> {copy.journey.all}
        </Link>

        <div className={styles.storyHeading}>
          <p className={styles.eyebrow}>{copy.journeys.fieldNote}</p>
          <h1>{story.title}</h1>
          <p className={styles.storyDescription}>
            {story.description || copy.journeys.noteFallback}
          </p>
          <div className={styles.storyMeta}>
            <span>{updatedAt}</span>
            {story.readingTimeMinutes ? (
              <span>{copy.journeys.minRead(story.readingTimeMinutes)}</span>
            ) : null}
            {story.tags?.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </header>

      {story.coverImage ? (
        <figure className={styles.storyCover}>
          <Image
            src={story.coverImage}
            alt={story.title}
            fill
            loader={getArchiveImageLoader(story.coverImage)}
            priority
            sizes="100vw"
            className={styles.imageCover}
          />
        </figure>
      ) : null}

      <section className={styles.storyBody}>
        <aside>
          <span>{copy.journeys.fieldNote}</span>
          <strong>YueYong</strong>
        </aside>
        <div className={styles.storyMarkdown}>
          {story.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {story.content}
            </ReactMarkdown>
          ) : (
            <p>{story.description || copy.journeys.noteFallback}</p>
          )}
        </div>
      </section>

      <footer className={styles.storyFooter}>
        <Link href="/journeys" className={styles.textLink}>
          {copy.journey.all} <ArrowUpRight size={15} strokeWidth={1.4} />
        </Link>
      </footer>
    </article>
  );
};
