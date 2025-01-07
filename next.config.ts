import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://magusemail.com/truelove-back/public/api/:path*',
      },
      {
        source: '/storage/:path*',
        destination: 'https://magusemail.com/truelove-back/public/storage/:path*',
      },
    ];
  },
};

export default nextConfig;
