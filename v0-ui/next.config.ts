import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/stableflow-mvp",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
