import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supplies its own Next.js build adapter and does not consume the
  // self-hosting bundle. Next.js 16.3 currently fails when that adapter and
  // `output: "standalone"` are enabled together because the adapter omits the
  // root NFT trace that the standalone copier still expects.
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["qiniu"],
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
