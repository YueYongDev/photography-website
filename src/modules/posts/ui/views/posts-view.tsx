import { PostsSection } from "../sections/posts-section";

export const PostsView = () => {
  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-xs text-muted-foreground">Manage your posts</p>
      </div>
      <PostsSection />
    </div>
  );
};
