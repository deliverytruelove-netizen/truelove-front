import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
<<<<<<< HEAD
=======
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://truelove-back.test:path*', // Cambia esto a la URL de tu API de Laravel
      },
    ];
  },
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
};

export default nextConfig;
