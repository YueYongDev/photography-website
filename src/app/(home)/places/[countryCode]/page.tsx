import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { getCountryGroups } from "@/modules/travel/lib/country-groups";
import { getPlacesCountryCode } from "@/modules/travel/lib/places-country";
import { CountryView } from "@/modules/travel/ui/views/country-view";
import type { TravelArchive } from "@/modules/travel/ui/views/travel-view";
import { trpc } from "@/trpc/server";

type Params = Promise<{ countryCode: string }>;

const getArchive = cache(async (): Promise<TravelArchive> => {
  try {
    return await trpc.travel.getArchive({ limit: 60 });
  } catch {
    return { items: [] };
  }
});

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  const { countryCode } = await params;
  const country = getCountryGroups(await getArchive()).find(
    (group) => group.code === getPlacesCountryCode(countryCode),
  );
  return {
    title: country ? `${country.name} · Places` : "Country · Places",
    description: country ? `Photographs from ${country.name}.` : undefined,
  };
};

const CountryPage = async ({ params }: { params: Params }) => {
  const { countryCode } = await params;
  if (countryCode.toUpperCase() === "HK") permanentRedirect("/places/cn");
  const country = getCountryGroups(await getArchive()).find(
    (group) => group.code.toLowerCase() === countryCode.toLowerCase(),
  );

  if (!country) notFound();

  return <CountryView country={country} />;
};

export default CountryPage;
