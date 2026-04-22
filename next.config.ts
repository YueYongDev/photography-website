import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
const r2Pattern: RemotePattern | null = r2PublicUrl
  ? (() => {
      try {
        const parsed = new URL(r2PublicUrl);
        const protocol =
          parsed.protocol === "https:" || parsed.protocol === "http:"
            ? (parsed.protocol.replace(":", "") as "https" | "http")
            : undefined;
        return {
          protocol,
          hostname: parsed.hostname,
          port: parsed.port,
        };
      } catch {
        return null;
      }
    })()
  : null;

const uzbekistanJourneyOrigin = (
  process.env.UZBEKISTAN_JOURNEY_ORIGIN ||
  "https://journey-uzbekistan-2026.vercel.app"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
    qualities: [25, 50, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "p.yueyong.fun",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn.ytools.xyz",
        port: "",
      },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/journeys/uzbekistan-2026",
        destination: `${uzbekistanJourneyOrigin}/`,
      },
      {
        source: "/journeys/uzbekistan-2026/:path*",
        destination: `${uzbekistanJourneyOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
