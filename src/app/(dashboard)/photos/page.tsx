import PhotosView from "@/modules/photos/ui/views/photos-view";
import { PageTransitionContainer } from "@/components/page-transition";

export const metadata = {
  title: "Photo Library",
  description: "Upload photographs and manage archive metadata.",
};

const page = () => {
  return (
    <PageTransitionContainer>
      <PhotosView />
    </PageTransitionContainer>
  );
};

export default page;
