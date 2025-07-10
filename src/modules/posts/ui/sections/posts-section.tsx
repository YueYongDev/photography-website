"use client";

// External dependencies
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { snakeCaseToTitle } from "@/lib/utils";

// Internal dependencies - UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Globe2Icon, LockIcon } from "lucide-react";

export const PostsSection = () => {
  return (
    <Suspense fallback={<PostsSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <PostsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PostsSectionSkeleton = () => {
  return (
    <>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Posts</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right pr-6">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-36" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[180px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-10" />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

const PostsSectionSuspense = () => {
  const [posts, query] = trpc.posts.getMany.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div className="border-y">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[510px]">Posts</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right pr-6">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.pages
            .flatMap((page) => page.items)
            .map((post) => (
              <Link href={`/posts/${post.id}`} key={post.id} legacyBehavior>
                <TableRow className="cursor-pointer">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-4">
                      <div className="relative aspect-video w-36 shrink-0">
                        <Image
                          src={post.coverImage || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          quality={20}
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="flex flex-col overflow-hidden gap-y-1">
                        <span className="text-sm line-clamp-1">
                          {post.title}
                        </span>

                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {post.description || "No description"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {post.visibility === "private" ? (
                        <LockIcon className="size-4 mr-2" />
                      ) : (
                        <Globe2Icon className="size-4 mr-2" />
                      )}
                      {snakeCaseToTitle(post.visibility)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs truncate">
                    {post.createdAt &&
                      new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                  </TableCell>
                  <TableCell>Travel</TableCell>
                  <TableCell className="text-right pr-6">
                    {post.tags &&
                      post.tags.map((tag) => (
                        <span key={tag} className="mr-2">
                          {tag}
                        </span>
                      ))}
                  </TableCell>
                </TableRow>
              </Link>
            ))}
        </TableBody>
      </Table>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </div>
  );
};
