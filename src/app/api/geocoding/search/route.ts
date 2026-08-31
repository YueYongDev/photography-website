import { NextResponse } from "next/server";

import { getCurrentSession } from "@/modules/auth/lib/auth";

const DEFAULT_GEOCODING_BASE_URL = "https://nominatim.openstreetmap.org";
const MAX_QUERY_LENGTH = 160;
const PROVIDER_INTERVAL_MS = 1_000;

let providerQueue: Promise<void> = Promise.resolve();
let lastProviderRequestAt = 0;

type NominatimAddress = Record<string, string | undefined>;

type NominatimSearchResult = {
  place_id?: number | string;
  osm_id?: number | string;
  lat?: string;
  lon?: string;
  display_name?: string;
  name?: string;
  address?: NominatimAddress;
};

const firstValue = (
  address: NominatimAddress,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const value = address[key]?.trim();
    if (value) return value;
  }

  return null;
};

const fetchFromProvider = (url: URL) => {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://p.yueyong.fun";
  const request = providerQueue.then(async () => {
    const waitTime = Math.max(
      0,
      PROVIDER_INTERVAL_MS - (Date.now() - lastProviderRequestAt),
    );

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    lastProviderRequestAt = Date.now();
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": `YueYongPhotography/1.0 (+${siteUrl})`,
      },
      next: { revalidate: 86_400 },
    });
  });

  providerQueue = request.then(
    () => undefined,
    () => undefined,
  );

  return request;
};

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user.id) {
    return NextResponse.json(
      { error: "Not authenticated", results: [] },
      { status: 401 },
    );
  }

  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("q")?.trim() ?? "";
  const language =
    requestUrl.searchParams.get("lang") === "zh-CN" ? "zh" : "en";

  if (query.length < 2) {
    return NextResponse.json(
      { error: "Enter at least two characters", results: [] },
      { status: 400 },
    );
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "Search query is too long", results: [] },
      { status: 400 },
    );
  }

  const baseUrl = (
    process.env.GEOCODING_BASE_URL ?? DEFAULT_GEOCODING_BASE_URL
  ).replace(/\/$/, "");
  const upstreamUrl = new URL(`${baseUrl}/search`);
  upstreamUrl.searchParams.set("q", query);
  upstreamUrl.searchParams.set("format", "jsonv2");
  upstreamUrl.searchParams.set("addressdetails", "1");
  upstreamUrl.searchParams.set("limit", "5");
  upstreamUrl.searchParams.set("accept-language", language);

  try {
    const response = await fetchFromProvider(upstreamUrl);

    if (!response.ok) {
      throw new Error(`Geocoding provider returned ${response.status}`);
    }

    const data = (await response.json()) as NominatimSearchResult[];
    const results = data.flatMap((item, index) => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);
      const displayName = item.display_name?.trim();

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !displayName
      ) {
        return [];
      }

      const address = item.address ?? {};
      const fallbackName = displayName.split(",")[0]?.trim() || displayName;
      const country = firstValue(address, ["country"]);
      const countryCode =
        firstValue(address, ["country_code"])?.toUpperCase() ?? null;
      const region = firstValue(address, ["state", "region", "province"]);
      const city = firstValue(address, [
        "city",
        "town",
        "village",
        "municipality",
        "hamlet",
      ]);
      const district = firstValue(address, [
        "city_district",
        "county",
        "suburb",
        "neighbourhood",
      ]);

      return [
        {
          id: String(
            item.place_id ??
              item.osm_id ??
              `${latitude}-${longitude}-${index}`,
          ),
          name:
            item.name?.trim() ||
            firstValue(address, ["tourism", "amenity", "road"]) ||
            fallbackName,
          displayName,
          latitude,
          longitude,
          country,
          countryCode,
          region,
          city,
          district,
          fullAddress: displayName,
          placeFormatted: displayName,
        },
      ];
    });

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "private, max-age=300" } },
    );
  } catch (error) {
    console.error("Address search failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Address search is temporarily unavailable", results: [] },
      { status: 502 },
    );
  }
}
