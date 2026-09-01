import { config } from "dotenv";

config({ path: ".env.local" });

type PhotoPlace = {
  id: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
};

type DesiredCitySet = {
  country: string;
  countryCode: string;
  city: string;
  photoIds: string[];
};

const getPlace = (photo: PhotoPlace) => {
  const country = photo.country?.trim();
  const countryCode = photo.countryCode?.trim().toUpperCase();
  const city = (
    countryCode === "JP" || countryCode === "TW"
      ? photo.region
      : photo.city
  )?.trim();

  if (!country || !countryCode || !city) return null;
  return { country, countryCode, city };
};

const getKey = (country: string, city: string) => `${country}\u0000${city}`;

const main = async () => {
  const apply = process.argv.includes("--apply");
  const [{ db }, schema, drizzle] = await Promise.all([
    import("../src/db/drizzle"),
    import("../src/db/schema/photos"),
    import("drizzle-orm"),
  ]);
  const { citySets, photos } = schema;
  const { desc, eq } = drizzle;

  const [photoRows, existingCitySets] = await Promise.all([
    db
      .select({
        id: photos.id,
        country: photos.country,
        countryCode: photos.countryCode,
        region: photos.region,
        city: photos.city,
      })
      .from(photos)
      .orderBy(desc(photos.updatedAt), desc(photos.id)),
    db.select().from(citySets),
  ]);

  const desiredByKey = new Map<string, DesiredCitySet>();

  for (const photo of photoRows) {
    const place = getPlace(photo);
    if (!place) continue;

    const key = getKey(place.country, place.city);
    const desired = desiredByKey.get(key) ?? { ...place, photoIds: [] };
    desired.photoIds.push(photo.id);
    desiredByKey.set(key, desired);
  }

  const existingByKey = new Map(
    existingCitySets.map((citySet) => [
      getKey(citySet.country, citySet.city),
      citySet,
    ]),
  );
  const upserts = Array.from(desiredByKey.entries()).filter(([key, desired]) => {
    const existing = existingByKey.get(key);
    return (
      !existing ||
      existing.countryCode !== desired.countryCode ||
      existing.photoCount !== desired.photoIds.length ||
      !desired.photoIds.includes(existing.coverPhotoId)
    );
  });
  const stale = existingCitySets.filter(
    (citySet) => !desiredByKey.has(getKey(citySet.country, citySet.city)),
  );

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        photos: photoRows.length,
        desiredCitySets: desiredByKey.size,
        upserts: upserts.map(([key, desired]) => {
          const existing = existingByKey.get(key);
          return {
            city: desired.city,
            country: desired.country,
            fromCount: existing?.photoCount ?? 0,
            toCount: desired.photoIds.length,
            coverWillChange:
              !existing || !desired.photoIds.includes(existing.coverPhotoId),
          };
        }),
        deletes: stale.map((citySet) => ({
          city: citySet.city,
          country: citySet.country,
          photoCount: citySet.photoCount,
        })),
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("Dry run only. Pass --apply to write these changes.");
    process.exit(0);
  }

  await db.transaction(async (tx) => {
    for (const [key, desired] of desiredByKey) {
      const existing = existingByKey.get(key);
      const coverPhotoId =
        existing && desired.photoIds.includes(existing.coverPhotoId)
          ? existing.coverPhotoId
          : desired.photoIds[0];

      await tx
        .insert(citySets)
        .values({
          country: desired.country,
          countryCode: desired.countryCode,
          city: desired.city,
          coverPhotoId,
          photoCount: desired.photoIds.length,
        })
        .onDuplicateKeyUpdate({
          set: {
            countryCode: desired.countryCode,
            coverPhotoId,
            photoCount: desired.photoIds.length,
            updatedAt: new Date(),
          },
        });
    }

    for (const citySet of stale) {
      await tx.delete(citySets).where(eq(citySets.id, citySet.id));
    }
  });

  console.log("City sets reconciled successfully.");
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
