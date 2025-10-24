/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: 'standalone',
  webpack(config) {
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 5000000, // ~5 MB max per chunk
      automaticNameDelimiter: '-',
    };
    return config;
  },
};

export default nextConfig;
