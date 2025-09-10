import { Metadata } from "next";
import { HydrateClient, trpc } from "@/trpc/server";
import { BlogSlugView } from "@/modules/blog/ui/views/blog-slug-view";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;

  // Convert slug to title format (e.g., "kyoto-autumn-zen-time" -> "Kyoto Autumn Zen Time")
  const title = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${title} - Blog`,
  };
}

const BlogSlugPage = async ({ params }: Props) => {
  const slug = (await params).slug;
  void trpc.blog.getOne({ slug });

  return (
    <HydrateClient>
      <BlogSlugView slug={slug} />
    </HydrateClient>
  );
};

export default BlogSlugPage;
