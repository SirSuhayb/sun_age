/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Skip problematic routes entirely
  generateBuildId: () => 'mobile-build',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': require('path').resolve(__dirname, 'src'),
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  // Disable features that cause issues with static export
  experimental: {},
};

module.exports = nextConfig;