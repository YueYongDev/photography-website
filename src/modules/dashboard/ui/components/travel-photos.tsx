import BlurImage from "@/components/blur-image";
import { useMapStore } from "@/hooks/use-map-store";
import type { DashboardTravelCitySet } from "./travel-types";
import styles from "../studio.module.css";
import { useStudioLocale } from "../../i18n/studio-locale";

interface TravelPhotosProps {
  data: DashboardTravelCitySet[];
}

export const TravelPhotos = ({ data }: TravelPhotosProps) => {
  const cityMap = useMapStore((state) => state.maps.city);
  const { copy, locale } = useStudioLocale();

  const handleHover = (citySet: DashboardTravelCitySet) => {
    if (
      citySet.coverPhoto.longitude === null ||
      citySet.coverPhoto.latitude === null
    ) {
      return;
    }

    cityMap?.flyTo({
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
                ).toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </p>
            <span>{copy.overview.frames(citySet.photoCount)}</span>
          </div>

          <div
            className={styles.travelThumb}
            style={{
              aspectRatio:
                citySet.coverPhoto.width > 0 && citySet.coverPhoto.height > 0
                  ? citySet.coverPhoto.width / citySet.coverPhoto.height
                  : citySet.coverPhoto.aspectRatio,
            }}
          >
            <BlurImage
              src={citySet.coverPhoto.url || "/placeholder.svg"}
              alt={citySet.city}
              fill
              sizes="(max-width: 760px) 30vw, 96px"
              className="object-contain"
              blurhash={citySet.coverPhoto.blurData}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
