import { PhotosSection } from "../sections/photos-section";

const PhotosView = () => {
  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Photos</h1>
        <p className="text-xs text-muted-foreground">Manage your photos</p>
      </div>
      <PhotosSection />
    </div>
  );
};

export default PhotosView;
