import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supplies its own Next.js build adapter and does not consume the
  // self-hosting bundle. Next.js 16.3 currently fails when that adapter and
  // `output: "standalone"` are enabled together because the adapter omits the
  // root NFT trace that the standalone copier still expects.
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["qiniu"],
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
  async headers() {
    return [
      {
        source: "/roadbooks/georgia-2026/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
