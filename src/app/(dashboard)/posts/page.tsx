import { PostsView } from "@/modules/posts/ui/views/posts-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Posts",
  description: "Manage your posts",
};

const PostsPage = () => {
  void trpc.posts.getMany.prefetchInfinite({
    limit: 10,
  });
  return (
    <HydrateClient>
      <PostsView />
    </HydrateClient>
  );
};

export default PostsPage;
