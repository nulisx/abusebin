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
  webpack(config, { isServer }) {
    if (isServer) {
      config.cache = false; // disables server webpack cache to reduce large files
    }
    return config;
  },
};

export default nextConfig;
