import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/lib/auth";
import {
  createPhotoObjectKey,
  uploadPhotoObject,
} from "@/lib/cloudbase-media";
import { COMPRESSED_IMAGE_SIZE_LIMIT } from "@/constants";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = (request.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, AVIF, and GIF images are supported" },
      { status: 415 }
    );
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > COMPRESSED_IMAGE_SIZE_LIMIT) {
    return NextResponse.json({ error: "Image is too large" }, { status: 413 });
  }

  const body = await request.arrayBuffer();
  if (!body.byteLength) {
    return NextResponse.json({ error: "Image is empty" }, { status: 400 });
  }
  if (body.byteLength > COMPRESSED_IMAGE_SIZE_LIMIT) {
    return NextResponse.json({ error: "Image is too large" }, { status: 413 });
  }

  try {
    const key = createPhotoObjectKey(contentType);
    const result = await uploadPhotoObject(key, contentType, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Photo upload failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Photo upload failed" }, { status: 502 });
  }
}
