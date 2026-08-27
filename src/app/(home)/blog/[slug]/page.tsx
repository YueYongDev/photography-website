import { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;

  // Convert slug to title format (e.g., "kyoto-autumn-zen-time" -> "Kyoto Autumn Zen Time")
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${title} - Journeys`,
  };
}

const BlogSlugPage = async ({ params }: Props) => {
  const { slug } = await params;
  redirect(`/journeys/${slug}`);
};

export default BlogSlugPage;
