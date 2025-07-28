/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': require('path').resolve(__dirname, 'src'),
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  // Merged from next.config.ts
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.modal.host",
    "*.trycloudflare.com",
  ],
  images: {
    domains: ['m.media-amazon.com', 'images-na.ssl-images-amazon.com'],
  },
};

module.exports = nextConfig; 