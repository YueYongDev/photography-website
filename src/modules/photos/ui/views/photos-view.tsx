"use client";

import { PhotosSection } from "../sections/photos-section";
import { PageTransitionItem } from "@/components/page-transition";
// Removed unused trpc import

const PhotosView = () => {
  // 移除了未使用的 photosQuery

  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <PageTransitionItem className="px-4">
        <h1 className="text-2xl font-bold">Photos</h1>
        <p className="text-xs text-muted-foreground">Manage your photos</p>
      </PageTransitionItem>
      <PageTransitionItem>
        <PhotosSection />
      </PageTransitionItem>
    </div>
  );
};

export default PhotosView;
