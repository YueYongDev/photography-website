import { useState } from "react";
import { toast } from "sonner";
import { uploadPhoto } from "@/lib/photo-upload";
import {
  type TExifFormData,
  type TImageInfo,
  getPhotoExif,
  getImageInfo,
  convertExifToFormData,
} from "@/lib/utils";
import imageCompression from "browser-image-compression";

interface UsePhotoUploadProps {
  onUploadSuccess?: (url: string) => void;
  compressionOptions?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
  };
}

export function usePhotoUpload({
  onUploadSuccess,
  compressionOptions = {},
}: UsePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<TExifFormData | null>(null);
  const [imageInfo, setImageInfo] = useState<TImageInfo | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const exifData = await getPhotoExif(file);
      const imageInfo = await getImageInfo(file);
      
      // 转换EXIF数据为表单数据格式
      const formattedExifData = convertExifToFormData(exifData);
      
      setExif(formattedExifData);
      setImageInfo(imageInfo);

      console.log("EXIF Data:", formattedExifData);

      // Compress the image before uploading
      const options = {
        maxSizeMB: compressionOptions.maxSizeMB || 1,
        maxWidthOrHeight: compressionOptions.maxWidthOrHeight || 1920,
        useWebWorker: compressionOptions.useWebWorker !== undefined ? compressionOptions.useWebWorker : true,
      };
      const compressedFile = await imageCompression(file, options);
      console.log(`Original file size: ${file.size / 1024 / 1024} MB`);
      console.log(`Compressed file size: ${compressedFile.size / 1024 / 1024} MB`);

      const { publicUrl } = await uploadPhoto({
        file: compressedFile,
      });

      setUploadedImageUrl(publicUrl);
      toast.success("Photo uploaded successfully!");
      onUploadSuccess?.(publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadedImageUrl,
    exif,
    imageInfo,
    handleUpload,
  };
}
