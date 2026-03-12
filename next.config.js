/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse uses Node.js built-ins — exclude from webpack bundling in API routes
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these Node.js modules — use native require at runtime
      config.externals = [...(config.externals || []), 'pdf-parse']
    }
    return config
  },
  // Allow pdf-parse to be used in API routes
  serverExternalPackages: ['pdf-parse'],
}
module.exports = nextConfig
