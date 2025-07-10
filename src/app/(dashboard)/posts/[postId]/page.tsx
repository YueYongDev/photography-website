import { HydrateClient, trpc } from "@/trpc/server";
import { PostView } from "@/modules/posts/ui/views/post-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ postId: string }>;
}

export const generateMetadata = async ({ params }: Props) => {
  const { postId } = await params;
  const post = await trpc.posts.getOne({ postId });

  return {
    title: post?.title,
    description: post?.description,
  };
};

const page = async ({ params }: Props) => {
  const { postId } = await params;
  void trpc.posts.getOne.prefetch({ postId });

  return (
    <HydrateClient>
      <PostView postId={postId} />
    </HydrateClient>
  );
};

export default page;
