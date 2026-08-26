import "server-only";

const STATIC_PREFIX = "photo-site/photos/";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function gatewayHeaders(key: string, contentType?: string) {
  return {
    Authorization: `Bearer ${requiredEnv("CLOUDBASE_MEDIA_GATEWAY_SECRET")}`,
    "X-Photo-Site-Key": key,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

function gatewayUrl() {
  return `${requiredEnv("CLOUDBASE_MEDIA_GATEWAY_URL").replace(/\/$/, "")}/object`;
}

function normalizeStaticBaseUrl() {
  return requiredEnv("CLOUDBASE_STATIC_PUBLIC_URL").replace(/\/$/, "");
}

export function createPhotoObjectKey(contentType: string) {
  const extensionByType: Record<string, string> = {
    "image/avif": "avif",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[contentType];
  if (!extension) throw new Error("Unsupported image type");
  return `${STATIC_PREFIX}${crypto.randomUUID()}.${extension}`;
}

export async function uploadPhotoObject(
  key: string,
  contentType: string,
  body: ArrayBuffer
) {
  const response = await fetch(gatewayUrl(), {
    method: "PUT",
    headers: gatewayHeaders(key, contentType),
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`CloudBase media upload failed with status ${response.status}`);
  }

  return {
    key,
    publicUrl: `${normalizeStaticBaseUrl()}/${key}`,
  };
}

export async function deletePhotoObjectByUrl(photoUrl: string) {
  const staticBaseUrl = new URL(normalizeStaticBaseUrl());
  const parsedUrl = new URL(photoUrl);
  if (parsedUrl.origin !== staticBaseUrl.origin) return false;

  const key = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ""));
  if (!key.startsWith(STATIC_PREFIX)) return false;

  const response = await fetch(gatewayUrl(), {
    method: "DELETE",
    headers: gatewayHeaders(key),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`CloudBase media delete failed with status ${response.status}`);
  }
  return true;
}
