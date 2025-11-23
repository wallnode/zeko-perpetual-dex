import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      o1js: require.resolve('o1js'),
    };
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};
export default nextConfig;
