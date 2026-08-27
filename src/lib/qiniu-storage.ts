import "server-only";

import * as qiniu from "qiniu";

import { COMPRESSED_IMAGE_SIZE_LIMIT, DEFAULT_FOLDER } from "@/constants";

const extensionByContentType: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function getMac() {
  return new qiniu.auth.digest.Mac(
    requiredEnv("QINIU_ACCESS_KEY"),
    requiredEnv("QINIU_SECRET_KEY")
  );
}

function getBucketManager() {
  return new qiniu.rs.BucketManager(
    getMac(),
    new qiniu.conf.Config({ useHttpsDomain: true })
  );
}

function getPublicBaseUrl() {
  return requiredEnv("QINIU_PUBLIC_URL").replace(/\/$/, "");
}

function createPhotoObjectKey(contentType: string) {
  const extension = extensionByContentType[contentType];
  if (!extension) throw new Error("Unsupported image type");
  return `${DEFAULT_FOLDER}/${crypto.randomUUID()}.${extension}`;
}

export function createPhotoUploadTicket(contentType: string) {
  const bucket = requiredEnv("QINIU_BUCKET");
  const key = createPhotoObjectKey(contentType);
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: `${bucket}:${key}`,
    expires: 10 * 60,
    insertOnly: 1,
    fsizeLimit: COMPRESSED_IMAGE_SIZE_LIMIT,
    mimeLimit: Object.keys(extensionByContentType).join(";"),
    detectMime: 1,
    returnBody:
      '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"mimeType":"$(mimeType)"}',
  });

  return {
    key,
    token: putPolicy.uploadToken(getMac()),
    publicUrl: `${getPublicBaseUrl()}/${key}`,
  };
}

export async function deletePhotoObjectByUrl(photoUrl: string) {
  const publicBase = new URL(`${getPublicBaseUrl()}/`);
  const parsedUrl = new URL(photoUrl);
  if (parsedUrl.origin !== publicBase.origin) return false;

  const basePath = publicBase.pathname;
  if (!parsedUrl.pathname.startsWith(basePath)) return false;

  const key = decodeURIComponent(parsedUrl.pathname.slice(basePath.length));
  if (!key.startsWith(`${DEFAULT_FOLDER}/`)) return false;

  await getBucketManager().delete(requiredEnv("QINIU_BUCKET"), key);
  return true;
}

export async function checkQiniuStorageConnection() {
  await getBucketManager().listPrefix(requiredEnv("QINIU_BUCKET"), {
    prefix: `${DEFAULT_FOLDER}/`,
    limit: 1,
  });
}
