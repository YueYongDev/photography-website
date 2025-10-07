"use client";

import { useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  className?: string;
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
  className,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "200px",
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

  const handleManualFetch = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {!isManual ? <div ref={targetRef} /> : null}

      {hasNextPage ? (
        isManual ? (
          <div className="flex w-full flex-col items-center gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              className="h-auto px-0 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              onClick={handleManualFetch}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  View more
                  <ChevronDown className="size-4" />
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Loader2 className="size-5 animate-spin opacity-75" />
          </div>
        )
      ) : null}
    </div>
  );
};
