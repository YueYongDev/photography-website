import { NextResponse } from "next/server";

import { getCurrentSession } from "@/modules/auth/lib/auth";

const DEFAULT_GEOCODING_BASE_URL = "https://nominatim.openstreetmap.org";
const PROVIDER_INTERVAL_MS = 1_000;

let providerQueue: Promise<void> = Promise.resolve();
let lastProviderRequestAt = 0;

type NominatimAddress = Record<string, string | undefined>;

type NominatimReverseResult = {
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
      next: { revalidate: 2_592_000 },
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
      { error: "Not authenticated", location: null },
      { status: 401 },
    );
  }

  const requestUrl = new URL(request.url);
  const latitudeParam = requestUrl.searchParams.get("lat");
  const longitudeParam = requestUrl.searchParams.get("lon");
  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);
  const language =
    requestUrl.searchParams.get("lang") === "zh-CN" ? "zh" : "en";

  if (
    latitudeParam === null ||
    longitudeParam === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "Invalid coordinates", location: null },
      { status: 400 },
    );
  }

  const baseUrl = (
    process.env.GEOCODING_BASE_URL ?? DEFAULT_GEOCODING_BASE_URL
  ).replace(/\/$/, "");
  const upstreamUrl = new URL(`${baseUrl}/reverse`);
  upstreamUrl.searchParams.set("lat", String(latitude));
  upstreamUrl.searchParams.set("lon", String(longitude));
  upstreamUrl.searchParams.set("format", "jsonv2");
  upstreamUrl.searchParams.set("addressdetails", "1");
  upstreamUrl.searchParams.set("zoom", "18");
  upstreamUrl.searchParams.set("accept-language", language);

  try {
    const response = await fetchFromProvider(upstreamUrl);

    if (!response.ok) {
      throw new Error(`Geocoding provider returned ${response.status}`);
    }

    const data = (await response.json()) as NominatimReverseResult;
    const address = data.address ?? {};
    const displayName = data.display_name?.trim() ?? null;
    const country = firstValue(address, ["country"]);
    const countryCode =
      firstValue(address, ["country_code"])?.toUpperCase() ?? null;
    const region = firstValue(address, ["state", "region", "province"]);
    const district = firstValue(address, [
      "city_district",
      "county",
      "suburb",
      "neighbourhood",
    ]);
    const city =
      firstValue(address, [
        "city",
        "town",
        "village",
        "municipality",
        "hamlet",
      ]) ?? district ?? region ?? data.name?.trim() ?? null;

    return NextResponse.json(
      {
        location: {
          country,
          countryCode,
          region,
          city,
          district,
          fullAddress: displayName,
          placeFormatted: displayName,
        },
      },
      { headers: { "Cache-Control": "private, max-age=86400" } },
    );
  } catch (error) {
    console.error("Reverse geocoding failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Location lookup is temporarily unavailable", location: null },
      { status: 502 },
    );
  }
}
