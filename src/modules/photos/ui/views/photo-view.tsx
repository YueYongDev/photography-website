import { FormSection } from "../sections/form-section";

interface PhotoViewProps {
  photoId: string;
}

const PhotoView = ({ photoId }: PhotoViewProps) => {
  return <FormSection photoId={photoId} />;
};

export default PhotoView;
