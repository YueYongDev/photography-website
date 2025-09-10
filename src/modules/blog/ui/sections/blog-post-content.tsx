"use client";

import Image from "next/image";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PostPreview } from "../components/post-preview";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import Link from "next/link";

interface Props {
  slug: string;
}

export const BlogPostContent = ({ slug }: Props) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
        
        <Suspense fallback={<p>Loading...</p>}>
          <ErrorBoundary fallback={<p>Something went wrong</p>}>
            <BlogPostContentSuspense slug={slug} />
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
};

export const BlogPostContentSuspense = ({ slug }: Props) => {
  const [data] = trpc.blog.getOne.useSuspenseQuery({ slug });
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="bg-card rounded-2xl shadow-xl overflow-hidden">
      {/* Cover image */}
      <div className="relative h-64 md:h-96 w-full">
        <Image
          src={data.coverImage || "/placeholder.svg"}
          alt={data.title}
          fill
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{data.title}</h1>
          <p className="text-lg md:text-xl opacity-90">{data.description}</p>
        </div>
      </div>

      {/* Post information */}
      <div className="p-6 border-b">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(data.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{data.readingTimeMinutes || 0} min read</span>
          </div>
          {data.tags && data.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{data.tags.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Post content */}
      <div className="p-6 md:p-8">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <PostPreview content={data.content} />
        </div>
      </div>

      {/* Post footer */}
      <div className="p-6 border-t bg-muted/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://cdn.ytools.xyz/photos/IMG_9251.jpg" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">Y</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">YueYong</p>
              <p className="text-xs text-muted-foreground">Photographer</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/blog">View More Posts</Link>
          </Button>
        </div>
      </div>
    </article>
  );
};