import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
