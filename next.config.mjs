import fs from "fs"
import path from "path"

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: "standalone",
  webpack(config) {
    config.optimization.splitChunks = {
      chunks: "all",
      maxSize: 20000000
    }
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.done.tap("RemoveNextCache", () => {
          try {
            const cachePath = path.resolve(process.cwd(), ".next/cache")
            if (fs.existsSync(cachePath)) fs.rmSync(cachePath, { recursive: true, force: true })
          } catch (err) {
            // intentionally swallows errors so the build itself doesnt fail here
            console.error("RemoveNextCache error:", err && err.message ? err.message : err)
          }
        })
      }
    })
    return config
  }
}

export default nextConfig
