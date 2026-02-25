/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Vercel handles image optimization automatically
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.saas.qa' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // Proxy API calls to Railway backend (avoids CORS in development)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
