const QINIU_MAX_DIMENSION = 50000;

export default function qiniuLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // For local images (starting with /), return the src directly
  // This includes /placeholder.svg and other local assets
  if (src.startsWith("/")) {
    return src;
  }

  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(src);
  } catch {
    return src;
  }

  if (parsedUrl.search) {
    return src;
  }

  if (parsedUrl.hostname !== "cdn.ytools.xyz") {
    return src;
  }

  const maxWidth = Math.min(width, QINIU_MAX_DIMENSION);
  const q = quality || 75;

  // Qiniu-style resizing: imageView2/2/w/<width>/q/<quality>
  // imageView2/2 is for width-limited resizing
  return `${src}?imageView2/2/w/${maxWidth}/q/${q}|imageslim`;
}
