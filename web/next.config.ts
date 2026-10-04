import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Repair tickets and job applications upload up to 5 files of 8 MB each.
    serverActions: { bodySizeLimit: "45mb" },
  },
};

export default nextConfig;
