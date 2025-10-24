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
      maxSize: 10000000, // ~10 MB per chunk
      automaticNameDelimiter: '-',
    };
    return config;
  },
};

export default nextConfig;
