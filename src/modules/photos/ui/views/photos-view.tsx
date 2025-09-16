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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Photos</h1>
            <p className="text-xs text-muted-foreground">Manage your photos</p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-1">
            <ImagePlus size={16} />
            Upload
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
