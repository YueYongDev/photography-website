import { useState, useEffect } from "react";

export interface AddressData {
  fullAddress: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
}

type LocationState = {
  data: AddressData | null;
  isLoading: boolean;
  error: string | null;
};

interface UseGetLocationProps {
  lat: number;
  lng: number;
}

export const useGetAddress = ({ lat, lng }: UseGetLocationProps) => {
  const [state, setState] = useState<LocationState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en&addressdetails=1`,
          {
            headers: {
              "User-Agent": "PhotographyWebsite/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const mappedData: AddressData = {
          fullAddress: data.display_name,
          country: data.address.country ?? null,
          countryCode: data.address.country_code?.toUpperCase() ?? null,
          region: data.address.state ?? null,
          city: data.address.city ?? data.address.town ?? data.address.village ?? null,
          district: data.address.suburb ?? null,
        };

        setState({ data: mappedData, isLoading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch location",
        });
      }
    };

    fetchLocation();
  }, [lat, lng]);

  return state;
};
