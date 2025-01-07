import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // images: {
  //   domains: ['localhost'],
  //   remotePatterns: [
  //     {
  //       protocol: 'http',
  //       hostname: 'localhost',
  //       port: '8000',
  //       pathname: '/storage/**',
  //     },
  //   ],
  // },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/storage/:path*',
        destination: 'http://localhost:8000/storage/:path*',
      },
    ];
  },
};

export default nextConfig;

