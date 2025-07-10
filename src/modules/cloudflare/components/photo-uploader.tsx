"use client";

import { usePhotoUpload } from "../hooks/usePhotoUpload";
import { PhotoForm } from "./photo-form";
import { UploadZone } from "./upload-zone";

interface PhotoUploaderProps {
  onUploadSuccess?: (url: string) => void;
  folder?: string;
  onCreateSuccess?: () => void;
}

export function PhotoUploader({
  onUploadSuccess,
  folder,
  onCreateSuccess,
}: PhotoUploaderProps) {
  const { isUploading, uploadedImageUrl, exif, imageInfo, handleUpload } =
    usePhotoUpload({
      folder,
      onUploadSuccess,
    });

  if (uploadedImageUrl && imageInfo) {
    return (
      <PhotoForm
        exif={exif}
        imageInfo={imageInfo}
        url={uploadedImageUrl}
        onCreateSuccess={onCreateSuccess}
      />
    );
  }

  return <UploadZone isUploading={isUploading} onUpload={handleUpload} />;
}
