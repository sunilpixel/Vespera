import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plates are pre-encoded to AVIF and WebP at build time at exactly the sizes
  // they are displayed, so the image optimiser would only add a round-trip.
  images: { unoptimized: true },
};

export default nextConfig;
