import type { ImageLoader, ImageLoaderProps } from "next/image";

const qiniuHosts = new Set(["cdn.ytools.xyz"]);

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

export const getArchiveImageLoader = (src: string): ImageLoader | undefined => {
  try {
    return qiniuHosts.has(new URL(src).hostname) ? qiniuImageLoader : undefined;
  } catch {
    return undefined;
  }
};
