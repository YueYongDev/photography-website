import BlurImage from "@/components/blur-image";
import { useMapStore } from "@/hooks/use-map-store";
import type { DashboardTravelCitySet } from "./travel-types";
import styles from "../studio.module.css";

interface TravelPhotosProps {
  data: DashboardTravelCitySet[];
}

export const TravelPhotos = ({ data }: TravelPhotosProps) => {
  const getMap = useMapStore((state) => state.getMap);
  const city = getMap("city");

  const handleHover = (citySet: DashboardTravelCitySet) => {
    if (!citySet.coverPhoto.longitude || !citySet.coverPhoto.latitude) return;

    city?.flyTo({
      center: [citySet.coverPhoto.longitude, citySet.coverPhoto.latitude],
      zoom: 11,
      duration: 1500,
    });
  };

  return (
    <div className={styles.travelList}>
      {data.map((citySet, index) => (
        <div
          className={styles.travelRow}
          key={citySet.id}
          onMouseEnter={() => handleHover(citySet)}
        >
          <span className={styles.travelRowNumber}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className={styles.travelRowCopy}>
            <h3>{citySet.city}</h3>
            <p>
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
            <span>{citySet.photoCount} frames</span>
          </div>

          <div className={styles.travelThumb}>
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
