import { PostSection } from "@/modules/blog/ui/sections/post-section";

interface Props {
  slug: string;
}

export const BlogSlugView = ({ slug }: Props) => {
  return (
    <div className="size-full">
      <PostSection slug={slug} />
    </div>
  );
};
