import { config } from "dotenv";

config({ path: ".env.local" });

type PhotoRow = {
  id: string;
  url: string;
  title: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
};

const getPlaceCity = (photo: PhotoRow) =>
  (
    photo.countryCode?.trim().toUpperCase() === "JP" ||
    photo.countryCode?.trim().toUpperCase() === "TW"
      ? photo.region
      : photo.city
  )?.trim() || null;

const getPlaceKey = (country: string, city: string) =>
  `${country}\u0000${city}`;

const toPlaceSlug = (value: string) => {
  const asciiSlug = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (asciiSlug) return asciiSlug;

  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
};

const main = async () => {
  const [{ db }, schema] = await Promise.all([
    import("../src/db/drizzle"),
    import("../src/db/schema/photos"),
  ]);
  const { citySets, photos } = schema;

  const [photoRows, citySetRows] = await Promise.all([
    db
      .select({
        id: photos.id,
        url: photos.url,
        title: photos.title,
        country: photos.country,
        countryCode: photos.countryCode,
        region: photos.region,
        city: photos.city,
      })
      .from(photos),
    db
      .select({
        id: citySets.id,
        country: citySets.country,
        countryCode: citySets.countryCode,
        city: citySets.city,
        photoCount: citySets.photoCount,
        coverPhotoId: citySets.coverPhotoId,
      })
      .from(citySets),
  ]);

  const assignedPhotos = photoRows.filter(
    (photo) =>
      photo.country?.trim() &&
      photo.countryCode?.trim() &&
      getPlaceCity(photo),
  );
  const unassignedPhotos = photoRows.filter(
    (photo) => !assignedPhotos.includes(photo),
  );
  const photosByPlace = new Map<string, PhotoRow[]>();

  for (const photo of assignedPhotos) {
    const country = photo.country!.trim();
    const city = getPlaceCity(photo)!;
    const key = getPlaceKey(country, city);
    const items = photosByPlace.get(key) ?? [];
    items.push(photo);
    photosByPlace.set(key, items);
  }

  const citySetsByPlace = new Map(
    citySetRows.map((citySet) => [
      getPlaceKey(citySet.country, citySet.city),
      citySet,
    ]),
  );
  const countMismatches = Array.from(photosByPlace.entries()).flatMap(
    ([key, placePhotos]) => {
      const citySet = citySetsByPlace.get(key);
      const firstPhoto = placePhotos[0];
      const coverIsValid = citySet
        ? placePhotos.some((photo) => photo.id === citySet.coverPhotoId)
        : false;
      const expectedCountryCode = firstPhoto.countryCode!.trim().toUpperCase();

      if (
        citySet &&
        citySet.photoCount === placePhotos.length &&
        citySet.countryCode === expectedCountryCode &&
        coverIsValid
      ) {
        return [];
      }

      return [
        {
          country: firstPhoto.country,
          countryCode: expectedCountryCode,
          city: getPlaceCity(firstPhoto),
          actualPhotos: placePhotos.length,
          storedPhotos: citySet?.photoCount ?? null,
          coverIsValid,
        },
      ];
    },
  );
  const staleCitySets = citySetRows.filter(
    (citySet) =>
      !photosByPlace.has(getPlaceKey(citySet.country, citySet.city)),
  );

  const routeGroups = new Map<string, typeof citySetRows>();
  const emptySlugs = citySetRows.filter(
    (citySet) => toPlaceSlug(citySet.city).length === 0,
  );
  for (const citySet of citySetRows) {
    const route = `${citySet.countryCode.toLowerCase()}/${toPlaceSlug(citySet.city)}`;
    const items = routeGroups.get(route) ?? [];
    items.push(citySet);
    routeGroups.set(route, items);
  }
  const routeCollisions = Array.from(routeGroups.entries())
    .filter(([, citySetsForRoute]) => citySetsForRoute.length > 1)
    .map(([route, citySetsForRoute]) => ({
      route,
      places: citySetsForRoute.map((citySet) => ({
        country: citySet.country,
        city: citySet.city,
      })),
    }));

  const duplicateUrls = Array.from(Map.groupBy(photoRows, (photo) => photo.url))
    .filter(([, duplicates]) => duplicates.length > 1)
    .map(([, duplicates]) => ({
      count: duplicates.length,
      photos: duplicates.map((photo) => ({
        id: photo.id,
        title: photo.title,
        country: photo.country,
        city: getPlaceCity(photo),
      })),
    }));

  const countries = new Map<
    string,
    { names: Set<string>; places: number; photos: number }
  >();
  for (const placePhotos of photosByPlace.values()) {
    const firstPhoto = placePhotos[0];
    const countryCode = firstPhoto.countryCode!.trim().toUpperCase();
    const country = countries.get(countryCode) ?? {
      names: new Set<string>(),
      places: 0,
      photos: 0,
    };
    country.names.add(firstPhoto.country!.trim());
    country.places += 1;
    country.photos += placePhotos.length;
    countries.set(countryCode, country);
  }

  const report = {
    totals: {
      photos: photoRows.length,
      assignedPhotos: assignedPhotos.length,
      unassignedPhotos: unassignedPhotos.length,
      countries: countries.size,
      citySets: citySetRows.length,
    },
    countries: Array.from(countries.entries())
      .map(([code, country]) => ({
        code,
        names: Array.from(country.names),
        places: country.places,
        photos: country.photos,
      }))
      .sort((left, right) => left.code.localeCompare(right.code)),
    countMismatches,
    staleCitySets: staleCitySets.map((citySet) => ({
      country: citySet.country,
      city: citySet.city,
      storedPhotos: citySet.photoCount,
    })),
    emptySlugs: emptySlugs.map((citySet) => ({
      countryCode: citySet.countryCode,
      city: citySet.city,
    })),
    routeCollisions,
    duplicateUrls,
    unassignedPhotos: unassignedPhotos.map((photo) => ({
      id: photo.id,
      title: photo.title,
      country: photo.country,
      countryCode: photo.countryCode,
      region: photo.region,
      city: photo.city,
    })),
  };

  console.log(JSON.stringify(report, null, 2));

  const hasHardFailure =
    countMismatches.length > 0 ||
    staleCitySets.length > 0 ||
    emptySlugs.length > 0 ||
    routeCollisions.length > 0;
  process.exit(hasHardFailure ? 1 : 0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
