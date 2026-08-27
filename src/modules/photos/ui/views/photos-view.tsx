import { PhotosSection } from "../sections/photos-section";
import { PhotoUploadModal } from "@/modules/dashboard/ui/components/photo-upload-modal";
import { StudioPageHeader } from "@/modules/dashboard/ui/components/studio-page-header";
import styles from "@/modules/dashboard/ui/studio.module.css";

const PhotosView = () => {
  return (
    <div className={styles.page}>
      <StudioPageHeader
        index="02"
        eyebrow="Photographs"
        title={<>The contact<br />sheets.</>}
        description="Every uploaded frame lives here—published photographs, private edits, and the quiet work still waiting to find its place."
        actions={
          <PhotoUploadModal
            triggerClassName={styles.primaryAction}
            triggerLabel="Add photographs"
          />
        }
      />
      <PhotosSection />
    </div>
  );
};

export default PhotosView;
