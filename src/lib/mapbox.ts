import { Feature, FeatureCollection, Point } from "geojson";

const MAPBOX_API = "https://api.mapbox.com/search/geocode/v6/reverse";

interface MapboxFeature extends Feature {
  geometry: Point;
  properties: {
    full_address: string;
    name: string;
    place_formatted: string;
    context: {
      country: {
        country_code: string;
        name: string;
      };
      locality: {
        name: string;
      } | null;
      place: {
        name: string;
      } | null;
      region: {
        name: string;
      } | null;
    };
  };
}

interface MapboxReverseGeocodingResponse extends FeatureCollection {
  features: MapboxFeature[];
  query: [number, number];
}

export async function getLocationFromCoordinates(
  latitude: number | null,
  longitude: number | null
): Promise<string | null> {
  if (!latitude || !longitude) return null;

  try {
    const response = await fetch(
      `${MAPBOX_API}?longitude=${longitude}&latitude=${latitude}&language=zh&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data: MapboxReverseGeocodingResponse = await response.json();

    if (data.features.length === 0) {
      return null;
    }

    // 获取第一个结果的完整地址
    const feature = data.features[0];
    const { context } = feature.properties;

    // 构建地址字符串
    const addressParts = [];

    // 添加国家
    if (context.country) {
      addressParts.push(context.country.name);
    }

    // 添加地区
    if (context.region) {
      addressParts.push(context.region.name);
    }

    // 添加城市
    if (context.place) {
      addressParts.push(context.place.name);
    }

    // 添加具体位置
    if (context.locality) {
      addressParts.push(context.locality.name);
    }

    // 添加详细地址
    if (feature.properties.name) {
      addressParts.push(feature.properties.name);
    }

    // 从大到小拼接地址
    return addressParts.join(", ");
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
}
