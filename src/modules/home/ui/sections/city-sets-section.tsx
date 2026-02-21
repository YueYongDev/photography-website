"use client";

import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import CityCard from "../components/city-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { CityCardLoadingSkeleton } from "@/components/loading-skeleton";

export const CitySetsSection = () => {
  return (
    <Suspense fallback={<CityCardLoadingSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <CitySetsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const CitySetsSectionSuspense = () => {
  const [data, query] = trpc.photos.getCitySetsPreview.useSuspenseInfiniteQuery(
    {
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="columns-1 md:columns-2 2xl:columns-3 gap-3">
        {data.pages.map((page) =>
          page.items.map((item) => (
            <div
              key={item.id}
              className="mb-3 break-inside-avoid-column"
            >
              <CityCard title={item.city} coverPhoto={item.coverPhoto} />
            </div>
          ))
        )}
      </div>

      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        className="pt-2"
      />
    </div>
  );
};
