/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
      serverComponentsExternalPackages: ["mongoose"]
    },
    logging: {
      fetches: {
        fullUrl: true
      }
    },
    images: {
      domains: ['lh3.googleusercontent.com', 'cdn.discordapp.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'assets.example.com',
          port: '',
          pathname: '/account123/**',
        },
      ],
    },
    webpack(config) {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      }
      return config
    }
  }
  
  module.exports = nextConfig