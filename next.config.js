/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Canonical domain redirect: www → non-www (permanent 308) ─────────────
  // Ensures https://www.upbeatheart.com/* → https://upbeatheart.com/*
  // Preserves full pathname + query string. Used for SEO canonical enforcement.
  async redirects() {
    return [
      {
        source:      '/:path*',
        has: [{ type: 'host', value: 'www.upbeatheart.com' }],
        destination: 'https://upbeatheart.com/:path*',
        permanent:   true,   // HTTP 308 — tells crawlers this is a permanent canonical
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/boc8bvoc/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
}

module.exports = nextConfig
