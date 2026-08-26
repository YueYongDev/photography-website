import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const cloudBaseStaticUrl = process.env.CLOUDBASE_STATIC_PUBLIC_URL;
const cloudBaseStaticPattern: RemotePattern | null = cloudBaseStaticUrl
  ? (() => {
      try {
        const parsed = new URL(cloudBaseStaticUrl);
        return {
          protocol: "https" as const,
          hostname: parsed.hostname,
          port: parsed.port,
          pathname: "/photo-site/photos/**",
        };
      } catch {
        return null;
      }
    })()
  : null;

const nextConfig: NextConfig = {
  output: "standalone",
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
      ...(cloudBaseStaticPattern ? [cloudBaseStaticPattern] : []),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/journeys/uzbekistan-2026",
        destination: "/journeys/uzbekistan-2026/index.html",
      },
      {
        source: "/journeys/newzealand-2026",
        destination: "/journeys/newzealand-2026/index.html",
      },
    ];
  },
};

export default nextConfig;
