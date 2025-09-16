"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhotoUploader } from "@/modules/cloudflare/components/photo-uploader";
import { ImagePlus } from "lucide-react";
import { useState } from "react";

export const PhotoUploadModal = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  
  // 如果传入了isOpen和onClose，则使用外部控制，否则使用内部状态
  const isUploading = isOpen !== undefined ? isOpen : internalIsUploading;
  const setIsUploading = onClose !== undefined ? onClose : setInternalIsUploading;

  return (
    <>
      <ResponsiveModal
        title="Upload a photo"
        open={isUploading}
        onOpenChange={() => setIsUploading(false)}
        className="h-[80vh] w-[80vw] max-w-none"
      >
        <ScrollArea className="pr-4">
          <PhotoUploader onCreateSuccess={() => setIsUploading(false)} />
        </ScrollArea>
      </ResponsiveModal>
      <Button
        onClick={() => setIsUploading(true)}
        variant="secondary"
        className="flex items-center gap-1"
      >
        <ImagePlus />
        Create
      </Button>
    </>
  );
};
