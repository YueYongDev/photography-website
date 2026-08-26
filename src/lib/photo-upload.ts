import { COMPRESSED_IMAGE_SIZE_LIMIT } from "@/constants";

interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  publicUrl: string;
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

export function uploadPhoto({ file, onProgress }: UploadOptions) {
  validateFile(file);

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (error) {
          reject(new UploadError("Upload returned an invalid response", error));
        }
        return;
      }
      reject(new UploadError(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new UploadError("Network error during upload"));
    xhr.ontimeout = () => reject(new UploadError("Upload timed out"));
    xhr.timeout = 45_000;
    xhr.open("PUT", "/api/media/upload");
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
