/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for PWA support
  output: 'standalone',
  // Disable server-side image optimization for PWA
  images: {
    unoptimized: true,
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
    ];
  },
};

module.exports = nextConfig; 