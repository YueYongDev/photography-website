import { BlogHomeView } from "@/modules/blog/ui/views/blog-home-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Welcome to my blog where I share thoughts, experiences, and insights.",
};

export const dynamic = "force-dynamic";

const BlogPage = () => {
  void trpc.blog.getMany.prefetchInfinite({
    limit: 10,
  });
  void trpc.blog.getLatest.prefetch();

  return (
    <HydrateClient>
      <BlogHomeView />
    </HydrateClient>
  );
};

export default BlogPage;
