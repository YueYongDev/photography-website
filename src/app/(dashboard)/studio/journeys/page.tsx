import { PostsView } from "@/modules/posts/ui/views/posts-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journeys",
  description: "Manage journey essays and field notes.",
};

const StudioJourneysPage = () => {
  void trpc.posts.getMany.prefetchInfinite({ limit: 10 });
  return (
    <HydrateClient>
      <PostsView />
    </HydrateClient>
  );
};

export default StudioJourneysPage;
