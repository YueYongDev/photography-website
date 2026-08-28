import { PageTransitionContainer } from "@/components/page-transition";
import PhotosView from "@/modules/photos/ui/views/photos-view";

export const metadata = {
  title: "Photographs",
  description: "Upload photographs and manage archive metadata.",
};

const StudioPhotosPage = () => (
  <PageTransitionContainer>
    <PhotosView />
  </PageTransitionContainer>
);

export default StudioPhotosPage;
