// removed unused imports

export async function getLocationFromCoordinates(
  latitude: number | null,
  longitude: number | null
): Promise<string | null> {
  if (!latitude || !longitude) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=zh`,
      {
        headers: {
          "User-Agent": "PhotographyWebsite/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
}
