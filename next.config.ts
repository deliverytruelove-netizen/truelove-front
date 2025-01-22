/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'magusemail.com',
        pathname: '/truelove-back/public/storage/**',
      }
    ],
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
