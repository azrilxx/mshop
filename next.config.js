/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-tenant domain configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Custom domain configuration for multi-tenant setup
  async rewrites() {
    return [
      // Allow custom domain routing
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'host',
            value: 'shop.muvonenergy.com',
          },
        ],
      },
    ]
  },

  // Environment-based configuration
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://shop.muvonenergy.com' 
      : 'http://localhost:3000',
  },
}

module.exports = nextConfig