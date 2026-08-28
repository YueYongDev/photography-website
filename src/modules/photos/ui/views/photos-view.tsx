"use client";

import { PhotosSection } from "../sections/photos-section";
import { PhotoUploadModal } from "@/modules/dashboard/ui/components/photo-upload-modal";
import { StudioPageHeader } from "@/modules/dashboard/ui/components/studio-page-header";
import styles from "@/modules/dashboard/ui/studio.module.css";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

const PhotosView = () => {
  const { copy } = useStudioLocale();

  return (
    <div className={`${styles.page} ${styles.photoPage}`}>
      <StudioPageHeader
        index="02"
        eyebrow={copy.photos.eyebrow}
        title={copy.photos.title}
        description={copy.photos.description}
        compact
        actions={
          <PhotoUploadModal
            triggerClassName={styles.primaryAction}
            triggerLabel={copy.photos.add}
          />
        }
      />
      <PhotosSection />
    </div>
  );
};

export default PhotosView;
