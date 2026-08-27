"use client";

import { useEffect, useRef, useState, memo } from "react";
import Image, { ImageProps } from "next/image";
import { Blurhash } from "react-blurhash";

import { getArchiveImageLoader } from "@/lib/archive-image-loader";

interface BlurImageProps extends Omit<ImageProps, "onLoad"> {
  blurhash: string;
}

/**
 * BlurImage component displays an image with a blurhash placeholder.
 *
 * @param {string} src - The source of the image.
 * @param {string} alt - The alt text of the image.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @param {string} fill - The fill of the image.
 * @param {string} className - Optional className for the component.
 * @param {string} blurhash - The blurhash of the image.
 * @returns {JSX.Element} - The BlurImage component.
 */
const BlurImage = memo(function BlurImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  blurhash,
  ...props
}: BlurImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const containerStyle = fill ? "absolute inset-0" : "relative w-full h-full";

  useEffect(() => {
    if (!imageRef.current) return;
    if (imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [src]);

  return (
    <div className={containerStyle}>
      {!imageLoaded && !imageError && blurhash && blurhash.length >= 6 && (
        <div className={`absolute inset-0 ${className}`}>
          <Blurhash
            hash={blurhash}
            width="100%"
            height="100%"
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        ref={imageRef}
        className={`${className} transition-opacity duration-300 ease-in-out ${
          imageLoaded && !imageError ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading={props.priority ? undefined : "lazy"}
        {...props}
        loader={
          props.loader ||
          (typeof src === "string" ? getArchiveImageLoader(src) : undefined)
        }
      />
    </div>
  );
});

export default BlurImage;
