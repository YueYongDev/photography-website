import "client-only";

import { upload } from "qiniu-js";

import { COMPRESSED_IMAGE_SIZE_LIMIT } from "@/constants";

interface UploadOptions {
  file: File;
  key: string;
  token: string;
  onProgress?: (progress: number) => void;
}

class UploadError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "UploadError";
  }
}

function validateFile(file: File) {
  if (file.size > COMPRESSED_IMAGE_SIZE_LIMIT) {
    throw new UploadError(
      `Compressed file size exceeds ${COMPRESSED_IMAGE_SIZE_LIMIT / 1024 / 1024}MB limit`
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new UploadError("Only image files are allowed");
  }
}

export function uploadPhoto({ file, key, token, onProgress }: UploadOptions) {
  validateFile(file);

  return new Promise<void>((resolve, reject) => {
    upload(
      file,
      key,
      token,
      {
        fname: file.name,
        mimeType: file.type,
      },
      {
        forceDirect: true,
        retryCount: 3,
        upprotocol: "https",
        disableStatisticsReport: true,
      }
    ).subscribe({
      next: (progress) => onProgress?.(Math.round(progress.total.percent)),
      error: (error) =>
        reject(
          new UploadError(
            error instanceof Error ? error.message : "Qiniu upload failed",
            error
          )
        ),
      complete: () => resolve(),
    });
  });
}
