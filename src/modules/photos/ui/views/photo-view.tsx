import { FormSection } from "../sections/form-section";
import styles from "../photo-editor.module.css";

interface PhotoViewProps {
  photoId: string;
}

const PhotoView = ({ photoId }: PhotoViewProps) => {
  return (
    <div className={styles.page}>
      <FormSection photoId={photoId} />
    </div>
  );
};

export default PhotoView;
