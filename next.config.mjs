/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: 'standalone',
  webpack(config) {
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 10000,
      maxSize: 5000000,
    }
    return config
  },
}

export default nextConfig
