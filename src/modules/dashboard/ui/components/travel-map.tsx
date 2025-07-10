import BlurImage from "@/components/blur-image";
import Mapbox, { MapboxProps } from "@/components/map";
import { CitySetWithPhotos } from "@/db/schema/photos";

interface TravelMapProps {
  data: CitySetWithPhotos[];
}

export const TravelMap = ({ data }: TravelMapProps) => {
  const initialMarker = {
    longitude: data[0].coverPhoto.longitude ?? -122.4,
    latitude: data[0].coverPhoto.latitude ?? 37.74,
  };

  const markers: MapboxProps["markers"] =
    data
      .flatMap((citySet) =>
        citySet.photos.filter(
          (
            photo
          ): photo is typeof photo & { longitude: number; latitude: number } =>
            photo.longitude !== null && photo.latitude !== null
        )
      )
      .map((photo) => ({
        id: photo.id,
        longitude: photo.longitude,
        latitude: photo.latitude,
        element: (
          <div className="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2">
            <div className="size-5 rounded-full overflow-hidden bg-background/20 ring-1 ring-white/20">
              <div
                className="w-full h-full"
                style={{ transform: "scale(1.2)" }}
              >
                <BlurImage
                  src={photo.url}
                  alt={photo.title}
                  fill
                  priority
                  quality={5}
                  blurhash={photo.blurData}
                  sizes="75vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ),
      })) || [];

  return (
    <div className="size-full relative overflow-hidden min-h-[300px]">
      <Mapbox
        id="city"
        markers={markers}
        initialViewState={{
          ...initialMarker,
          zoom: 11,
        }}
      />

      {/* Gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-linear-to-r from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-linear-to-l from-background" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/6 bg-linear-to-b from-background" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/6 bg-linear-to-t from-background" />
    </div>
  );
};
