import { useState, useEffect } from "react";

export interface AddressData {
  features: Array<{
    properties: {
      full_address: string;
      place_formatted: string;
      context: {
        country: {
          country_code: string;
          name: string;
        } | null;
        locality: {
          name: string;
        } | null;
        place: {
          name: string;
        } | null;
        region: {
          name: string;
        } | null;
      };
    };
  }>;
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

        // Map Nominatim to Mapbox-like structure for compatibility
        const mappedData: AddressData = {
          features: [
            {
              properties: {
                full_address: data.display_name,
                place_formatted: data.display_name,
                context: {
                  country: data.address.country ? {
                    name: data.address.country,
                    country_code: data.address.country_code?.toUpperCase(),
                  } : null,
                  region: data.address.state ? { name: data.address.state } : null,
                  place: (data.address.city || data.address.town || data.address.village) ? {
                    name: data.address.city || data.address.town || data.address.village
                  } : null,
                  locality: data.address.suburb ? { name: data.address.suburb } : null,
                }
              }
            }
          ]
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
