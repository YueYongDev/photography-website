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
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

export const PostsView = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { copy } = useStudioLocale();

  return (
    <div className={styles.page}>
      <StudioPageHeader
        index="03"
        eyebrow={copy.journeys.eyebrow}
        title={copy.journeys.title}
        description={copy.journeys.description}
        actions={
          <Button
            className={styles.primaryAction}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            {copy.journeys.newNote}
          </Button>
        }
      />
      <PostsSection />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>{copy.journeys.createTitle}</DialogTitle>
          </DialogHeader>
          <CreatePostSection
            onCreateSuccess={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
