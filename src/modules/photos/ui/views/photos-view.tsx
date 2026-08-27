"use client";

import { useState } from "react";
import { PhotosSection } from "../sections/photos-section";
import { PageTransitionItem } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { PhotoUploadModal } from "@/modules/dashboard/ui/components/photo-upload-modal";

const PhotosView = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <PageTransitionItem className="px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Studio / Archive</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Photo Library</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every uploaded photograph is listed here, including private drafts.
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-1">
            <ImagePlus size={16} />
            Upload photo
          </Button>
        </div>
      </PageTransitionItem>
      <PageTransitionItem>
        <PhotosSection />
      </PageTransitionItem>

      <PhotoUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
};

export default PhotosView;
