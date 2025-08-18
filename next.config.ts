import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'f4.bcbits.com',
        port: '',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: '*.bcbits.com',
        port: '',
        pathname: '/img/**',
      },
    ],
  },
};

export default nextConfig;
