/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  webpack(config) {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 25000000,
    };
    return config;
  },
}

export default nextConfig
