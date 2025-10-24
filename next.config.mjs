/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: 'standalone',
  webpack(config) {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 5120000,
      minSize: 100000,
    }
    config.optimization.runtimeChunk = 'single'
    config.cache = false
    return config
  },
}

export default nextConfig
