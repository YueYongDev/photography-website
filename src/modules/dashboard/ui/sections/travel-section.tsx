"use client";

import { ErrorBoundary } from "react-error-boundary";
import { TravelMap } from "../components/travel-map";
import { TravelPhotos } from "../components/travel-photos";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export const TravelSection = () => {
  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <TravelSectionContent />
    </ErrorBoundary>
  );
};

export const TravelSectionSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full h-[500px] border">
      <div className="grid grid-cols-1 gap-4 w-full border-r">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="size-full" />
        ))}
      </div>
      <Skeleton className="size-full" />
    </div>
  );
};

const TravelSectionContent = () => {
  const { data, isLoading } = trpc.travel.getCitySets.useQuery({
    limit: 4,
  });

  if (isLoading) {
    return <TravelSectionSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full border">
      <TravelPhotos data={data?.items || []} />
      <TravelMap data={data?.items || []} />
    </div>
  );
};
