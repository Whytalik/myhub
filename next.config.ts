import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Тепер це стабільна опція на верхньому рівні
  cacheComponents: true,
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
