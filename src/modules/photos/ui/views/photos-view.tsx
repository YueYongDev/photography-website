"use client";

import { PhotosSection } from "../sections/photos-section";
import { PageTransitionItem } from "@/components/page-transition";
import { trpc } from "@/trpc/client";

const PhotosView = () => {
  // 在组件顶层调用 useQuery 来触发数据获取
  const photosQuery = trpc.photos.getManyWithPrivate.useQuery({ limit: 5 });

  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <PageTransitionItem className="px-4">
        <h1 className="text-2xl font-bold">Photos</h1>
        <p className="text-xs text-muted-foreground">Manage your photos</p>
      </PageTransitionItem>
      <PageTransitionItem>
        <PhotosSection />
      </PageTransitionItem>
    </div>
  );
};

export default PhotosView;
