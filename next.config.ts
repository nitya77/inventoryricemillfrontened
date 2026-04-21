import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/inventory',
        destination: '/construction',
        permanent: true,
      },
      {
        source: '/attendance',
        destination: '/hrms',
        permanent: true,
      },
      {
        source: '/employees',
        destination: '/hrms/employees',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
