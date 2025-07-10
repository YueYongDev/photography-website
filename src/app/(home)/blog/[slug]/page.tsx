import { Metadata } from "next";
import { HydrateClient, trpc } from "@/trpc/server";
import { BlogSlugView } from "@/modules/blog/ui/views/blog-slug-view";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;

  const title = slug.split("-").join(" ");

  return {
    title,
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
