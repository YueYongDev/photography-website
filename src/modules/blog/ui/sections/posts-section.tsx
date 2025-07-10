"use client";

// External dependencies
import { trpc } from "@/trpc/client";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Internal dependencies - UI Components
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { InfiniteScroll } from "@/components/infinite-scroll";

export const PostsSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <PostsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PostsSectionSuspense = () => {
  const [data, query] = trpc.blog.getMany.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-3">
      {data.pages.map((page) =>
        page.items.map((item) => (
          <AspectRatio ratio={3 / 4} key={item.id}>
            <Link
              href={`/blog/${item.slug}`}
              className="block w-full h-full relative rounded-xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={item.coverImage || "/placeholder.svg"}
                alt="Image"
                fill
                unoptimized
                priority
                className="object-cover group-hover:blur-xs transition-[filter] duration-300 ease-out"
              />

              <div className="absolute w-full bottom-0 p-3">
                <div className="bg-background backdrop-blur-xs p-4 rounded-lg flex items-center justify-between gap-8">
                  <h2 className="font-light line-clamp-2">{item.title}</h2>

                  <div className="relative mr-2">
                    <span className="text-sm font-light">Read</span>
                    <div className="absolute bottom-[2px] left-0 w-full h-[1px] bg-black dark:bg-white transition-all duration-300 transform ease-in-out group-hover:w-1/3"></div>
                  </div>
                </div>
              </div>
            </Link>
          </AspectRatio>
        ))
      )}

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </div>
  );
};
