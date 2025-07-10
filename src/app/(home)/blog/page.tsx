import { BlogView } from "@/modules/blog/ui/views/blog-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog page",
};

export const dynamic = "force-dynamic";

const BlogPage = () => {
  void trpc.blog.getMany.prefetchInfinite({
    limit: 10,
  });
  void trpc.blog.getLatest.prefetch();

  return (
    <HydrateClient>
      <BlogView />
    </HydrateClient>
  );
};

export default BlogPage;
