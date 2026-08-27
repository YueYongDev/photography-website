import { FormSection } from "../sections/form-section";
import styles from "@/modules/dashboard/ui/studio.module.css";

interface Props {
  postId: string;
}

export const PostView = ({ postId }: Props) => {
  return (
    <div className={styles.editorPage}>
      <FormSection postId={postId} />
    </div>
  );
};
