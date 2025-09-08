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
  
  // For external images, use Cloudflare Image Resizing
  // Ensure width doesn't exceed Cloudflare's maximum dimension
  const maxWidth = Math.min(width, CLOUDFLARE_MAX_DIMENSION);
  const params = [`width=${maxWidth}`];
  if (!quality) {
    quality = 30; // Default quality if not provided
  }
  params.push(`quality=${quality}`);
  params.push(`fit=cover`);
  const paramsString = params.join(",");

  return `https://cdn.yueyong.fun/cdn-cgi/image/${paramsString}/${normalizeSrc(
    src
  )}`;
}
