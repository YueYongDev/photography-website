"use client";

import { useState } from "react";
import { PostsSection } from "../sections/posts-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePostSection } from "../sections/create-post-section";
import { StudioPageHeader } from "@/modules/dashboard/ui/components/studio-page-header";
import styles from "@/modules/dashboard/ui/studio.module.css";

export const PostsView = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className={styles.page}>
      <StudioPageHeader
        index="03"
        eyebrow="Journeys"
        title={
          <>
            Journeys &<br />
            field notes.
          </>
        }
        description="Write the shorter essays that publish inside Journeys. Structured travel features keep their chapter format; these notes join the same public archive as a continuous read."
        actions={
          <Button
            className={styles.primaryAction}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            New field note
          </Button>
        }
      />
      <PostsSection />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Create Field Note</DialogTitle>
          </DialogHeader>
          <CreatePostSection
            onCreateSuccess={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
