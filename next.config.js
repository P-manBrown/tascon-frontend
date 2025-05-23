const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})
const withPWA = require('next-pwa')({
  // See https://github.com/GoogleChrome/workbox/issues/1790
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
  reactStrictMode: true,
  serverExternalPackages: ['pino'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: process.env.REMOTE_PATTERN_PROTOCOL,
        hostname: process.env.REMOTE_PATTERN_HOSTNAME,
        port: process.env.REMOTE_PATTERN_PORT,
        pathname: process.env.REMOTE_PATTERN_PATHNAME,
      },
    ],
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
