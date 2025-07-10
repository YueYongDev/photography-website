import { FormSection } from "../sections/form-section";

interface Props {
  postId: string;
}

export const PostView = ({ postId }: Props) => {
  return (
    <div className="pt-2.5 px-4">
      <FormSection postId={postId} />
    </div>
  );
};
