import { BlogPostContent } from "@/modules/blog/ui/sections/blog-post-content";

interface Props {
  slug: string;
}

export const BlogSlugView = ({ slug }: Props) => {
  return (
    <div className="size-full">
      <BlogPostContent slug={slug} />
    </div>
  );
};
