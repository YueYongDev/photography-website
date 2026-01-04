"use client";

// External dependencies
import { useEffect, useState } from "react";
import {
  Map,
  MapMarker,
  MapControls,
  MarkerContent,
  MarkerPopup,
  useMap,
} from "@/components/ui/map";
import { useTheme } from "next-themes";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface MapProps {
  id?: string;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  markers?: Array<{
    id: string;
    longitude: number;
    latitude: number;
    popupContent?: React.ReactNode;
    element?: React.ReactNode;
  }>;
  geoJsonData?: GeoJSON.FeatureCollection;
  onMarkerDragEnd?: (lngLat: { lng: number; lat: number }) => void;
  onGeoJsonClick?: (feature: GeoJSON.Feature) => void;
  draggableMarker?: boolean;
  showGeocoder?: boolean;
}

// GeoJSON layer component
const GeoJsonLayer = ({
  data,
  onClick,
}: {
  data: GeoJSON.FeatureCollection;
  onClick?: (feature: GeoJSON.Feature) => void;
}) => {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !data) return;

    const sourceId = "geojson-source";
    const layerId = "geojson-layer";

    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(data as GeoJSON.FeatureCollection);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: data,
      });

      map.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.5,
        },
      });
    }

    const handleLayerClick = (e: { features?: GeoJSON.Feature[] }) => {
      if (onClick && e.features && e.features.length > 0) {
        onClick(e.features[0]);
      }
    };

    map.on("click", layerId, handleLayerClick);
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      map.off("click", layerId, handleLayerClick);
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, isLoaded, data, onClick]);

  return null;
};

// Simple Geocoder replacement using Nominatim
const SimpleGeocoder = () => {
  const { map, isLoaded } = useMap();
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !map || !isLoaded) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "PhotographyWebsite/1.0",
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        map.flyTo({
          center: [parseFloat(lon), parseFloat(lat)],
          zoom: 14,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="absolute top-2 left-2 z-20 flex gap-2"
    >
      <div className="relative group">
        <Input
          type="text"
          placeholder="Search location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 h-9 bg-background/80 backdrop-blur-sm border-muted-foreground/20 text-sm pl-9 focus-visible:ring-1"
        />
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Button size="sm" type="submit" className="hidden">Search</Button>
      </div>
    </form>
  );
};

const MapComponent = ({
  id,
  initialViewState = {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 14,
  },
  markers = [],
  geoJsonData,
  onMarkerDragEnd,
  onGeoJsonClick,
  draggableMarker = false,
  showGeocoder = false,
}: MapProps) => {

  return (
    <div className="relative w-full h-full min-h-[300px]" id={id}>
      <Map
        center={[initialViewState.longitude, initialViewState.latitude]}
        zoom={initialViewState.zoom}
      >
        <MapControls
          showLocate
          showZoom
          position="bottom-left"
        />

        {showGeocoder && <SimpleGeocoder />}

        {markers.map((marker) => (
          <MapMarker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            draggable={draggableMarker}
            onDragEnd={onMarkerDragEnd}
          >
            <MarkerContent>
              {marker.element || (
                <div className="size-6 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform" />
              )}
            </MarkerContent>
            {marker.popupContent && (
              <MarkerPopup className="p-0 border-none bg-transparent shadow-none overflow-visible">
                <div className="relative">
                  {marker.popupContent}
                </div>
              </MarkerPopup>
            )}
          </MapMarker>
        ))}

        {geoJsonData && (
          <GeoJsonLayer data={geoJsonData} onClick={onGeoJsonClick} />
        )}
      </Map>
    </div>
  );
};

export default MapComponent;
