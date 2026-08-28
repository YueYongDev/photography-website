"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhotoUploader } from "@/modules/cloudflare/components/photo-uploader";
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

export const PhotoUploadModal = ({
  isOpen,
  onClose,
  triggerClassName,
  triggerLabel = "Upload photograph",
}: {
  isOpen?: boolean;
  onClose?: () => void;
  triggerClassName?: string;
  triggerLabel?: string;
}) => {
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const { copy } = useStudioLocale();
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
        title={copy.photos.uploadTitle}
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
          className={cn("flex items-center gap-1", triggerClassName)}
        >
          <ImagePlus />
          {triggerLabel}
        </Button>
      )}
    </>
  );
};
