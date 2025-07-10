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
  const [data, query] = trpc.photos.getCitySets.useSuspenseInfiniteQuery(
    {
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
      {data.pages.map((page) =>
        page.items.map((item) => (
          <CityCard
            key={item.id}
            title={item.city}
            coverPhoto={item.coverPhoto}
          />
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
