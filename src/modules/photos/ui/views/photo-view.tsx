import { FormSection } from "../sections/form-section";
import styles from "@/modules/dashboard/ui/studio.module.css";

interface PhotoViewProps {
  photoId: string;
}

const PhotoView = ({ photoId }: PhotoViewProps) => {
  return (
    <div className={styles.editorPage}>
      <FormSection photoId={photoId} />
    </div>
  );
};

export default PhotoView;
