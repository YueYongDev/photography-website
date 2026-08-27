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

export const PostsSection = () => (
  <Suspense fallback={<PostsSectionSkeleton />}>
    <ErrorBoundary
      fallback={
        <div className={styles.errorState}>
          The journey-note index could not be opened.
        </div>
      }
    >
      <PostsSectionSuspense />
    </ErrorBoundary>
  </Suspense>
);

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
  const [posts, query] = trpc.posts.getMany.useSuspenseInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const items = posts.pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        No field notes have been started yet.
      </div>
    );
  }

  return (
    <>
      <div className={styles.archiveToolbar}>
        <span>{items.length} field notes loaded</span>
        <span>Published inside Journeys</span>
      </div>
      <div className={styles.postList}>
        {items.map((post, index) => {
          const created = post.createdAt
            ? new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
            : "No date";

          return (
            <Link
              href={`/posts/${post.id}`}
              className={styles.postRow}
              key={post.id}
            >
              <span className={styles.postNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.postImage}>
                <Image
                  src={cleanImageUrl(post.coverImage)}
                  alt={post.title || "Field note cover"}
                  fill
                  loader={getArchiveImageLoader(cleanImageUrl(post.coverImage))}
                  quality={30}
                  className="object-cover"
                  sizes="(max-width: 620px) 100vw, (max-width: 1100px) 42vw, 28vw"
                />
              </div>
              <div className={styles.postCopy}>
                <h2 className={styles.postTitle}>
                  {post.title || "Untitled field note"}
                </h2>
                <p>
                  {post.description ||
                    "A journey still waiting for its first note."}
                </p>
              </div>
              <div className={styles.postAside}>
                <span className={styles.postVisibility}>
                  {post.visibility === "private" ? (
                    <LockIcon size={11} />
                  ) : (
                    <Globe2Icon size={11} />
                  )}
                  {post.visibility}
                </span>
                <span>{created}</span>
                <span>Field note</span>
                <span className={styles.postTags}>
                  {post.tags?.length ? post.tags.join(" · ") : "No tags"}
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
