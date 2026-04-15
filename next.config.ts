import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Enable smooth View Transitions for page navigation
    viewTransition: true,
  },
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
