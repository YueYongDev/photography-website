"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Globe2Icon, LockIcon } from "lucide-react";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { getArchiveImageLoader } from "@/lib/archive-image-loader";
import { cleanImageUrl } from "@/lib/utils";
import styles from "@/modules/dashboard/ui/studio.module.css";
import { trpc } from "@/trpc/client";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

export const PostsSection = () => {
  const { copy } = useStudioLocale();
  return (
    <Suspense fallback={<PostsSectionSkeleton />}>
      <ErrorBoundary
        fallback={<div className={styles.errorState}>{copy.journeys.error}</div>}
      >
        <PostsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PostsSectionSkeleton = () => (
  <div className={styles.postList} aria-hidden="true">
    {Array.from({ length: 5 }).map((_, index) => (
      <div className={styles.postRow} key={index}>
        <span className={styles.postNumber}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className={`${styles.postImage} ${styles.skeletonBlock}`} />
        <div>
          <div className={`${styles.skeletonBlock} h-8 w-2/3`} />
          <div className={`${styles.skeletonBlock} mt-3 h-3 w-full`} />
        </div>
        <div className={`${styles.skeletonBlock} h-10 w-full`} />
      </div>
    ))}
  </div>
);

const PostsSectionSuspense = () => {
  const { copy, locale } = useStudioLocale();
  const [posts, query] = trpc.posts.getMany.useSuspenseInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const items = posts.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        {copy.journeys.empty}
      </div>
    );
  }

  return (
    <>
      <div className={styles.archiveToolbar}>
        <span>{copy.journeys.loaded(items.length)}</span>
        <span>{copy.journeys.destination}</span>
      </div>
      <div className={styles.postList}>
        {items.map((post, index) => {
          const created = post.createdAt
            ? new Date(post.createdAt).toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
            : copy.journeys.noDate;

          return (
            <Link
              href={`/studio/journeys/${post.id}`}
              className={styles.postRow}
              key={post.id}
            >
              <span className={styles.postNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.postImage}>
                <Image
                  src={cleanImageUrl(post.coverImage)}
                  alt={post.title || copy.journeys.untitled}
                  fill
                  loader={getArchiveImageLoader(cleanImageUrl(post.coverImage))}
                  quality={30}
                  className="object-cover"
                  sizes="(max-width: 620px) 100vw, (max-width: 1100px) 42vw, 28vw"
                />
              </div>
              <div className={styles.postCopy}>
                <h2 className={styles.postTitle}>
                  {post.title || copy.journeys.untitled}
                </h2>
                <p>
                  {post.description ||
                    copy.journeys.waiting}
                </p>
              </div>
              <div className={styles.postAside}>
                <span className={styles.postVisibility}>
                  {post.visibility === "private" ? (
                    <LockIcon size={11} />
                  ) : (
                    <Globe2Icon size={11} />
                  )}
                  {post.visibility === "private" ? copy.journeys.private : copy.journeys.public}
                </span>
                <span>{created}</span>
                <span>{copy.journeys.fieldNote}</span>
                <span className={styles.postTags}>
                  {post.tags?.length ? post.tags.join(" · ") : copy.journeys.noTags}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <InfiniteScroll
        className={styles.loadMore}
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </>
  );
};
