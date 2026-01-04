const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

// Cloudflare Images maximum dimension allowed
const CLOUDFLARE_MAX_DIMENSION = 50000;

export default function cloudflareLoader({
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

  if (parsedUrl.hostname !== "p.yueyong.fun" && parsedUrl.hostname !== "cdn.ytools.xyz") {
    return src;
  }

  // For external images, use Image Resizing
  const maxWidth = Math.min(width, CLOUDFLARE_MAX_DIMENSION);
  const q = quality || 75;

  // Qiniu-style resizing: imageView2/2/w/<width>/q/<quality>
  // imageView2/2 is for width-limited resizing
  return `${src}?imageView2/2/w/${maxWidth}/q/${q}|imageslim`;
}
