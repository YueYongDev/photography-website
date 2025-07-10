"use client";

import { useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * InfiniteScroll component displays a infinite scroll.
 *
 * @returns {JSX.Element} - The InfiniteScroll component.
 */
export const InfiniteScroll = ({
  isManual,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    isManual,
    fetchNextPage,
  ]);
  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={targetRef} />

      {hasNextPage ? (
        <div className="flex items-center justify-center">
          <Loader2 className="size-5 animate-spin opacity-75" />
        </div>
      ) : null}
    </div>
  );
};
