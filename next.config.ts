import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/hearings", destination: "/daily-listings", permanent: false },
      {
        source: "/hearings/new",
        destination: "/daily-listings/new",
        permanent: false,
      },
      {
        source: "/hearings/:id/edit",
        destination: "/daily-listings/:id/edit",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
