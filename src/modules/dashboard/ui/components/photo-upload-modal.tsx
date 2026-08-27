"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhotoUploader } from "@/modules/cloudflare/components/photo-uploader";
import { ImagePlus } from "lucide-react";
import { useState } from "react";

export const PhotoUploadModal = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const isControlled = isOpen !== undefined && onClose !== undefined;
  const isUploading = isControlled ? isOpen : internalIsUploading;

  const setIsUploading = (open: boolean) => {
    if (isControlled) {
      if (!open) onClose();
      return;
    }
    setInternalIsUploading(open);
  };

  return (
    <>
      <ResponsiveModal
        title="Upload a photo"
        open={isUploading}
        onOpenChange={setIsUploading}
        className="h-[80vh] w-[80vw] max-w-none"
      >
        <ScrollArea className="pr-4">
          <PhotoUploader onCreateSuccess={() => setIsUploading(false)} />
        </ScrollArea>
      </ResponsiveModal>
      {!isControlled && (
        <Button
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-1"
        >
          <ImagePlus />
          Upload photo
        </Button>
      )}
    </>
  );
};
