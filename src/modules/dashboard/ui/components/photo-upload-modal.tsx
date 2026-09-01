"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { BatchPhotoImporter } from "@/modules/photos/ui/components/batch-photo-importer";
import { ImagesIcon } from "lucide-react";
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
  const [closeRequestSignal, setCloseRequestSignal] = useState(0);
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
        onOpenChange={(open) => {
          if (open) setIsUploading(true);
          else setCloseRequestSignal((signal) => signal + 1);
        }}
        className="h-[min(90vh,920px)] w-[min(94vw,1380px)] max-w-none grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 [&>div:first-child]:px-4 [&>div:first-child]:py-3 [&>button]:z-50 [&>button]:rounded-full [&>button]:bg-white/90"
      >
        <BatchPhotoImporter
          onRequestClose={() => setIsUploading(false)}
          onImportSuccess={() => undefined}
          closeRequestSignal={closeRequestSignal}
        />
      </ResponsiveModal>
      {!isControlled && (
        <Button
          onClick={() => setIsUploading(true)}
          className={cn("flex items-center gap-1", triggerClassName)}
        >
          <ImagesIcon />
          {triggerLabel}
        </Button>
      )}
    </>
  );
};
