"use client";

import { useState } from "react";
import { PostsSection } from "../sections/posts-section";
import { PageTransitionItem } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePostSection } from "../sections/create-post-section";

export const PostsView = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <PageTransitionItem className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Posts</h1>
            <p className="text-xs text-muted-foreground">Manage your posts</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
      </PageTransitionItem>
      <PageTransitionItem>
        <PostsSection />
      </PageTransitionItem>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <CreatePostSection onCreateSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
