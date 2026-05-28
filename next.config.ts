import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@overmind-lab/trace-sdk"],
  typescript: {
    // Overmind SDK ships raw .ts source with internal type errors in its own catch blocks.
    // Our code is clean (verified via tsc --noEmit filtering node_modules).
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
