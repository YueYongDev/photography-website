import PhotosView from "@/modules/photos/ui/views/photos-view";
import { PageTransitionContainer } from "@/components/page-transition";

const page = () => {
  return (
    <PageTransitionContainer>
      <PhotosView />
    </PageTransitionContainer>
  );
};

export default page;
