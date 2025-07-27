/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for PWA support
  output: 'standalone',
  
  // Re-enable image optimization for better performance
  images: {
    unoptimized: false, // Enable optimization for better performance
    formats: ['image/webp', 'image/avif'], // Modern formats for better compression
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'atanaskyurkchiev.info',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize chunks (removed experimental features that cause issues)
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  
  // Add headers for service worker
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Cache static assets
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 