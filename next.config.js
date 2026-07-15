/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  reactStrictMode: true,
};

module.exports = nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
