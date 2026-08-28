import type { ImageLoader, ImageLoaderProps } from "next/image";

const qiniuHosts = new Set(["cdn.ytools.xyz"]);
const pexelsHosts = new Set(["images.pexels.com"]);

export const qiniuImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  try {
    const imageUrl = new URL(src);
    if (!qiniuHosts.has(imageUrl.hostname)) return src;

    imageUrl.search = "";
    imageUrl.hash = "";
    return `${imageUrl.toString()}?imageView2/2/w/${width}/q/${quality || 75}|imageslim`;
  } catch {
    return src;
  }
};

export const pexelsImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  try {
    const imageUrl = new URL(src);
    imageUrl.searchParams.set("auto", "compress");
    imageUrl.searchParams.set("cs", "tinysrgb");
    imageUrl.searchParams.set("w", String(width));
    imageUrl.searchParams.set("q", String(quality || 75));
    return imageUrl.toString();
  } catch {
    return src;
  }
};

export const getArchiveImageLoader = (src: string): ImageLoader | undefined => {
  try {
    const hostname = new URL(src).hostname;
    if (qiniuHosts.has(hostname)) return qiniuImageLoader;
    if (pexelsHosts.has(hostname)) return pexelsImageLoader;
    return undefined;
  } catch {
    return undefined;
  }
};
