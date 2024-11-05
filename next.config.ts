import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://truelove-back.test:path*', // Cambia esto a la URL de tu API de Laravel
      },
    ];
  },
};

export default nextConfig;
