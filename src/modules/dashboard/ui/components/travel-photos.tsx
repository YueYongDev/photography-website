import BlurImage from "@/components/blur-image";
import type { CitySetWithPhotos } from "@/db/schema/photos";
import { ImageIcon } from "lucide-react";
import { useMap } from "react-map-gl";

interface TravelPhotosProps {
  data: CitySetWithPhotos[];
}

export const TravelPhotos = ({ data }: TravelPhotosProps) => {
  const { city } = useMap();

  const handleHover = (citySet: CitySetWithPhotos) => {
    if (!citySet.coverPhoto.longitude || !citySet.coverPhoto.latitude) return;

    city?.flyTo({
      center: [citySet.coverPhoto.longitude, citySet.coverPhoto.latitude],
      zoom: 11,
      duration: 1500,
    });
  };

  return (
    <div className="grid grid-cols-1 w-full border-r">
      {data.map((citySet) => (
        <div
          className="p-4 w-full flex items-center justify-between border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
          key={citySet.id}
          onMouseEnter={() => handleHover(citySet)}
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">{citySet.city}</h2>
            <p className="text-muted-foreground text-sm">
              {citySet.country}
              {", "}
              {citySet.coverPhoto.dateTimeOriginal &&
                new Date(
                  citySet.coverPhoto.dateTimeOriginal
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <ImageIcon className="text-muted-foreground" size={16} />
                <span className="text-sm text-muted-foreground">
                  {citySet.photoCount}
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-16 aspect-4/3 overflow-hidden">
            <BlurImage
              src={citySet.coverPhoto.url || "/placeholder.svg"}
              alt={citySet.city}
              fill
              className="object-cover"
              blurhash={citySet.coverPhoto.blurData}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
