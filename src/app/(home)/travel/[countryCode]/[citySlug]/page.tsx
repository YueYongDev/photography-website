import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getCountryGroups, toPlaceSlug } from "@/modules/travel/lib/country-groups";
import { CityView } from "@/modules/travel/ui/views/city-view";
import type { TravelArchive } from "@/modules/travel/ui/views/travel-view";
import { HydrateClient, trpc } from "@/trpc/server";

type Params = Promise<{ countryCode: string; citySlug: string }>;

const findCity = cache(async (countryCode: string, citySlug: string) => {
  let archive: TravelArchive = { items: [] };
  try {
    archive = await trpc.travel.getArchive({ limit: 60 });
  } catch {
    // A missing remote archive is handled as a not-found place below.
  }
  const country = getCountryGroups(archive).find(
    (group) => group.code.toLowerCase() === countryCode.toLowerCase()
  );
  const city = country?.cities.find((entry) => toPlaceSlug(entry.city) === citySlug);
  return { country, city };
});

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const { countryCode, citySlug } = await params;
  const { country, city } = await findCity(countryCode, citySlug);
  return {
    title: city ? `${city.city} — ${country?.name}` : "Place — Travel",
    description: city ? `A photographic place study from ${city.city}, ${country?.name}.` : undefined,
  };
};

const CityPage = async ({ params }: { params: Params }) => {
  const { countryCode, citySlug } = await params;
  const { country, city } = await findCity(countryCode, citySlug);

  if (!country || !city || city.id.startsWith("fallback-")) notFound();

  void trpc.photos.getCitySetByCity.prefetch({
    city: city.city,
    countryCode: country.code,
  });

  return (
    <HydrateClient>
      <CityView city={city.city} countryCode={country.code} />
    </HydrateClient>
  );
};

export default CityPage;
