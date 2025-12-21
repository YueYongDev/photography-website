"use client";

// External dependencies
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useEffect } from "react";
import { trpc } from "@/trpc/client";

// Internal dependencies - UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BlurImage from "@/components/blur-image";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { snakeCaseToTitle } from "@/lib/utils";
import { Globe2Icon, HeartCrack, HeartIcon, LockIcon } from "lucide-react";

export const PhotosSection = () => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <PhotosSectionContent />
    </ErrorBoundary>
  );
};

const PhotosSectionSkeleton = () => {
  return (
    <>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Photos</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-36" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[180px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-xs truncate">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

const PhotosSectionContent = () => {
  const { data: photos, ...query } =
    trpc.photos.getManyWithPrivate.useInfiniteQuery(
      {
        limit: 15,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  // 预加载图片
  useEffect(() => {
    if (photos && photos.pages) {
      // 获取当前显示的图片列表
      const currentPhotos = photos.pages.flatMap((page) => page.items);

      // 预加载当前显示图片的后续图片
      const preloadCount = Math.min(5, currentPhotos.length);
      for (let i = 0; i < preloadCount; i++) {
        const img = new Image();
        img.src = currentPhotos[i].url;
      }
    }
  }, [photos]);

  if (!photos) {
    return <PhotosSectionSkeleton />
  }

  return (
    <div className="border-y">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[510px]">Photos</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Len</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right pr-6">Favorite</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {photos.pages
            .flatMap((page) => page.items)
            .map((photo) => (
              <PhotoTableRow key={photo.id} photo={photo} />
            ))}
        </TableBody>
      </Table>

      <InfiniteScroll
        hasNextPage={query.hasNextPage || false}
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage || false}
      />
    </div>
  );
};

const PhotoTableRow = memo(({ photo }: {
  photo: {
    id: string;
    url: string;
    title: string;
    description: string;
    visibility: string;
    dateTimeOriginal: Date | null;
    make: string | null;
    model: string | null;
    lensModel: string | null;
    focalLength35mm: number | null;
    city: string | null;
    countryCode: string | null;
    isFavorite: boolean;
    blurData: string;
    updatedAt: Date;
  }
}) => {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/photos/${photo.id}`)}
    >
      <TableCell className="pl-6">
        <div className="flex items-center gap-4">
          <div className="relative aspect-video w-36 shrink-0">
            <BlurImage
              src={photo.url}
              alt={photo.title}
              fill
              quality={30}
              className="object-cover"
              blurhash={photo.blurData}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex flex-col overflow-hidden gap-y-1">
            <span className="text-sm line-clamp-1">
              {photo.title}
            </span>

            <span className="text-xs text-muted-foreground line-clamp-1">
              {photo.description || "No description"}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          {photo.visibility === "private" ? (
            <LockIcon className="size-4 mr-2" />
          ) : (
            <Globe2Icon className="size-4 mr-2" />
          )}
          {snakeCaseToTitle(photo.visibility)}
        </div>
      </TableCell>
      <TableCell className="text-xs truncate">
        {photo.dateTimeOriginal &&
          new Date(photo.dateTimeOriginal).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }
          )}
      </TableCell>
      <TableCell>
        <p className="line-clamp-1">
          {photo.make} {photo.model}
        </p>
      </TableCell>
      <TableCell>
        <p className="line-clamp-1">
          {photo.lensModel}
          <span className="text-muted-foreground ml-2 text-xs">
            {photo.focalLength35mm}mm
          </span>
        </p>
      </TableCell>
      <TableCell>
        <p className="line-clamp-1">
          {photo.city}, {photo.countryCode}
        </p>
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="inline-block">
          {photo.isFavorite ? (
            <HeartIcon className="stroke-rose-500 fill-rose-500" />
          ) : (
            <HeartCrack className="text-muted-foreground" />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});
PhotoTableRow.displayName = "PhotoTableRow";
