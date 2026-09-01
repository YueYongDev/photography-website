import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { getCountryGroups } from "@/modules/travel/lib/country-groups";
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
    (group) => group.code.toLowerCase() === countryCode.toLowerCase(),
  );
  return {
    title: country ? `${country.name} · Places` : "Country · Places",
    description: country ? `Photographs from ${country.name}.` : undefined,
  };
};

const CountryPage = async ({ params }: { params: Params }) => {
  const { countryCode } = await params;
  const country = getCountryGroups(await getArchive()).find(
    (group) => group.code.toLowerCase() === countryCode.toLowerCase(),
  );

  if (!country) notFound();

  const cities = await Promise.all(
    country.cities.map(async (city) => {
      try {
        const citySet = await trpc.photos.getCitySetByCity({
          city: city.city,
          countryCode: country.code,
        });
        const seen = new Set<string>();
        const photos = [citySet?.coverPhoto, ...(citySet?.photos ?? [])].flatMap(
          (photo) => {
            if (!photo || seen.has(photo.id)) return [];
            seen.add(photo.id);
            return [
              {
                id: photo.id,
                url: photo.url,
                title: photo.title,
                description: photo.description,
                blurData: photo.blurData,
                width: photo.width,
                height: photo.height,
                aspectRatio: photo.aspectRatio,
              },
            ];
          },
        );

        return photos.length > 0 ? { ...city, photos } : city;
      } catch {
        return city;
      }
    }),
  );

  return <CountryView country={{ ...country, cities }} />;
};

export default CountryPage;
