"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Tag } from "lucide-react";

export const BlogPostsList = () => {
  return (
    <div className="space-y-6">
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <BlogPostsListSuspense />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

const BlogPostsListSuspense = () => {
  const [data, query] = trpc.blog.getMany.useSuspenseInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.pages.map((page) =>
          page.items.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                {post.coverImage ? (
                  <div className="relative h-48 w-full">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="bg-muted h-48 flex items-center justify-center">
                    <span className="text-muted-foreground">No cover image</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.updatedAt)}</span>
                    </div>
                    {post.readingTimeMinutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readingTimeMinutes} min read</span>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold line-clamp-2">{post.title}</h2>
                  
                  {post.description && (
                    <p className="text-muted-foreground line-clamp-3">
                      {post.description}
                    </p>
                  )}
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button variant="outline" asChild>
                  <Link href={post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`}>
                    Read More
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
      />
    </>
  );
};