import { CityView } from "@/modules/travel/ui/views/city-view";
import { HydrateClient, trpc } from "@/trpc/server";

type Params = Promise<{ cityName: string }>;

// Helper function to format the city name
const formatCityName = (cityName: string) => {
  return cityName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const generateMetadata = async ({ params }: { params: Params }) => {
  const { cityName } = await params;
  const formattedCityName = formatCityName(decodeURIComponent(cityName));
  return {
    title: `${formattedCityName} - Travel`,
  };
};

const CityPage = async ({ params }: { params: Params }) => {
  const { cityName } = await params;
  const formattedCityName = formatCityName(decodeURIComponent(cityName));
  void trpc.photos.getCitySetByCity.prefetch({ city: formattedCityName });

  return (
    <HydrateClient>
      <CityView city={formattedCityName} />
    </HydrateClient>
  );
};

export default CityPage;
