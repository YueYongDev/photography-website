import MapComponent, { MapProps } from "@/components/map";
import type { DashboardTravelCitySet } from "./travel-types";
import styles from "../studio.module.css";

interface TravelMapProps {
  data: DashboardTravelCitySet[];
}

export const TravelMap = ({ data }: TravelMapProps) => {
  if (data.length === 0) {
    return (
      <div className={styles.mapFrame} />
    );
  }

  const defaultCenter = { longitude: -122.4, latitude: 37.74 };
  const coverPhoto = data[0]?.coverPhoto;
  const initialMarker = {
    longitude: coverPhoto?.longitude ?? defaultCenter.longitude,
    latitude: coverPhoto?.latitude ?? defaultCenter.latitude,
  };

  const markers: MapProps["markers"] =
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
          <div className="relative cursor-pointer group -translate-y-[90%]">
            <div className="relative w-5 h-7 bg-[#788984] rounded-t-full rounded-bl-full rotate-45 border-[1.5px] border-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-[#657772]">
              <div className="-rotate-45 w-full h-full flex items-center justify-center">
                <div className="size-3 rounded-full bg-white/40 border border-white/20 shadow-inner" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-black/20 rounded-full blur-[0.5px]" />
          </div>
        ),
      })) || [];

  return (
    <div className={styles.mapFrame}>
      <MapComponent
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
