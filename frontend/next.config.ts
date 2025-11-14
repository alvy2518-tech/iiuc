import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Suppress hydration warnings caused by browser extensions
  compiler: {
    removeConsole: false,
  },
  // Note: The allowedDevOrigins warning is for a future Next.js version
  // Current workaround: The dev server already accepts connections from network IPs
  // The warning can be safely ignored in development
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
};

export default nextConfig;
