import type { NextConfig } from "next";

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
    ],
  },
};

export default nextConfig;
