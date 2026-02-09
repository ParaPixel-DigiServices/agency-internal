import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
  ]
};

export default nextConfig;
