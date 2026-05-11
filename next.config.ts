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
