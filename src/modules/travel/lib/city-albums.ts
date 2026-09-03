// Keep aliases scoped to a country: names alone are not a place identifier.
const cityAliases: Record<string, readonly (readonly string[])[]> = {
  UZ: [
    ["Samarkand", "Samarkand City", "撒马尔罕"],
    ["Bukhara", "布哈拉"],
    ["Tashkent", "塔什干"],
  ],
};

export const getCityAliases = (city: string, countryCode: string): string[] => {
  const name = city.trim();
  const aliases = cityAliases[countryCode.trim().toUpperCase()]?.find((names) =>
    names.some((alias) => alias.toLowerCase() === name.toLowerCase()),
  );
  return aliases ? [...aliases] : [name];
};

export const getCanonicalCity = (city: string, countryCode: string) =>
  getCityAliases(city, countryCode)[0];

type AlbumPhoto = { id: string; url: string };
type CityAlbum = {
  city: string;
  countryCode: string;
  photoCount: number;
  coverPhoto: AlbumPhoto | null;
  photos: AlbumPhoto[];
};

export const mergeCityAlbums = <T extends CityAlbum>(albums: T[]): T[] => {
  const groups = new Map<string, T>();

  for (const album of albums) {
    const countryCode = album.countryCode.trim().toUpperCase();
    const city = getCanonicalCity(album.city, countryCode);
    const key = `${countryCode}\u0000${city.toLowerCase()}`;
    const previous = groups.get(key);
    // Prefer the established album's cover, while retaining all source photos.
    const primary = previous && previous.photoCount >= album.photoCount
      ? previous
      : album;
    const photos = Array.from(
      new Map(
        [
          ...(previous?.photos ?? []),
          previous?.coverPhoto,
          album.coverPhoto,
          ...album.photos,
        ].flatMap((photo) => photo ? [[photo.id, photo] as const] : []),
      ).values(),
    );

    groups.set(key, {
      ...primary,
      city,
      countryCode,
      coverPhoto: primary.coverPhoto ?? photos[0] ?? null,
      photoCount: (previous?.photoCount ?? 0) + album.photoCount,
      photos,
    });
  }

  return Array.from(groups.values());
};
