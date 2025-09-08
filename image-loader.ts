const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

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
  
  // For external images, use Cloudflare Image Resizing
  const params = [`width=${width}`];
  if (!quality) {
    quality = 75; // Default quality if not provided
  }
  params.push(`quality=${quality}`);
  const paramsString = params.join(",");

  return `https://cdn.yueyong.fun/cdn-cgi/image/${paramsString}/${normalizeSrc(
    src
  )}`;
}
