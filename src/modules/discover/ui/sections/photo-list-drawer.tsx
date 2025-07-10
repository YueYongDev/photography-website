"use client";

import BlurImage from "@/components/blur-image";
import { Photo } from "@/db/schema/photos";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useMap } from "react-map-gl";
import type { RenderImageContext, RenderImageProps } from "react-photo-album";
import PhotoAlbum from "react-photo-album";
import "react-photo-album/styles.css";
import { motion } from "motion/react";

interface CustomPhotoType {
  src: string;
  width: number;
  height: number;
  alt: string;
  key: string;
  customData: {
    blurHash: string;
    latitude: number;
    longitude: number;
  };
}

interface PhotoListDrawerProps {
  photos: Photo[];
  className?: string;
}

export const PhotoListDrawer = ({
  photos,
  className,
}: PhotoListDrawerProps) => {
  const { discoverMap } = useMap();
  const [isOpen, setIsOpen] = useState(false);

  const photoAlbumPhotos = useMemo(() => {
    if (!photos) return [];
    return photos.map((photo) => ({
      src: photo.url,
      width: photo.width || 800,
      height: photo.height || 600,
      alt: photo.title,
      key: photo.id,
      customData: {
        blurHash: photo.blurData,
        latitude: photo.latitude,
        longitude: photo.longitude,
      },
    }));
  }, [photos]);

  const PhotoItem = ({
    photo,
    sizes,
    width,
    height,
    onClick,
  }: {
    photo: CustomPhotoType;
    sizes?: string;
    width: number;
    height: number;
    onClick: () => void;
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
      <motion.div
        className="relative bg-background/60 group cursor-pointer overflow-hidden rounded-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={onClick}
        style={{
          width: "100%",
          position: "relative",
          aspectRatio: `${width} / ${height}`,
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <p className="text-sm text-muted-foreground">
              Failed to load image
            </p>
          </div>
        ) : (
          <BlurImage
            fill
            src={photo.src}
            alt={photo.alt}
            sizes={sizes || "100vw"}
            blurhash={photo.customData.blurHash}
            quality={50}
            priority
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            className="transition-transform group-hover:scale-105"
          />
        )}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-background/60 backdrop-blur-xs p-2 translate-y-full"
          initial={{ y: "100%" }}
          animate={{ y: "100%" }}
          whileHover={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <p className="text-sm truncate font-medium">{photo.alt}</p>
          <p className="text-xs text-muted-foreground truncate">
            {photo.customData.latitude?.toFixed(6)},{" "}
            {photo.customData.longitude?.toFixed(6)}
          </p>
        </motion.div>
      </motion.div>
    );
  };

  const renderNextImage = (
    { sizes }: RenderImageProps,
    { photo, width, height }: RenderImageContext
  ) => {
    const customPhoto = photo as unknown as CustomPhotoType;
    return (
      <PhotoItem
        photo={customPhoto}
        sizes={sizes}
        width={width}
        height={height}
        onClick={() =>
          handleClick({
            latitude: customPhoto.customData.latitude,
            longitude: customPhoto.customData.longitude,
          })
        }
      />
    );
  };

  const handleClick = useCallback(
    ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      discoverMap?.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        duration: 3000,
      });
    },
    [discoverMap]
  );

  return (
    <motion.div
      initial={false}
      animate={{
        x: isOpen ? 0 : "calc(100% - 2.5rem)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed -right-10 top-14 sm:top-20 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] z-50",
        className
      )}
    >
      {/* Handle with animation */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-4 -translate-x-full flex flex-col items-center cursor-pointer group"
      >
        <div className="rounded-l-md bg-background border border-r-0 border-border px-2 py-3 shadow-lg">
          <motion.div
            animate={!isOpen ? {
              x: [-2, 2, -2],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                !isOpen ? "rotate-180" : "",
                "group-hover:scale-110"
              )}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        className="h-full w-[90vw] sm:w-[50vw] bg-background/80 backdrop-blur-xs border-l border-border shadow-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full w-full overflow-y-auto pr-2 sm:pr-4">
          <div className="space-y-4 p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Photos</h2>
              <span className="text-sm text-muted-foreground">
                {photoAlbumPhotos.length} items
              </span>
            </div>
            {/* Photo Album */}
            <PhotoAlbum
              photos={photoAlbumPhotos}
              layout="masonry"
              spacing={4}
              columns={(containerWidth) => {
                if (containerWidth < 300) return 1;
                return 2;
              }}
              render={{ image: renderNextImage }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
