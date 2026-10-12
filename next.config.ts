import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All data lives in IndexedDB. Export the shell so it needs no Next server.
  output: "export",
};

export default nextConfig;
