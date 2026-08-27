import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel supplies its own Next.js build adapter and does not consume the
  // self-hosting bundle. Next.js 16.3 currently fails when that adapter and
  // `output: "standalone"` are enabled together because the adapter omits the
  // root NFT trace that the standalone copier still expects.
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["qiniu"],
  images: {
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
};

export default nextConfig;
