import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dlhd.link',
      },
      // Allow any image source for now as logos can come from anywhere
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
