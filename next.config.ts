import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supplies its own Next.js build adapter and does not consume the
  // self-hosting bundle. Next.js 16.3 currently fails when that adapter and
  // `output: "standalone"` are enabled together because the adapter omits the
  // root NFT trace that the standalone copier still expects.
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["qiniu"],
  async redirects() {
    return [
      { source: "/studio", destination: "/studio/overview", permanent: true },
      { source: "/dashboard", destination: "/studio/overview", permanent: true },
      { source: "/photos/:path*", destination: "/studio/photos/:path*", permanent: true },
      { source: "/posts/:path*", destination: "/studio/journeys/:path*", permanent: true },
      { source: "/profile", destination: "/studio/account", permanent: true },
      { source: "/travel/:path*", destination: "/places/:path*", permanent: true },
      { source: "/discover", destination: "/map", permanent: true },
      { source: "/places/map", destination: "/map", permanent: true },
      { source: "/city", destination: "/map", permanent: true },
    ];
  },
  images: {
    qualities: [25, 30, 35, 50, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.ytools.xyz",
        port: "",
      },
    ],
  },
};

export default nextConfig;
