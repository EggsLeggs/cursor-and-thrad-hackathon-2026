import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@overmind-lab/trace-sdk"],
};

export default nextConfig;
