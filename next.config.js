/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public'
})

const nextConfig = {
    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true
    },
    experimental: {
        serverComponentsExternalPackages: ['mongoose']
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
                pathname: '/account123/**'
            }
        ]
    },
    // async headers() {
    //     return [
    //         {
    //             source: '/api/:path*',
    //             headers: [
    //                 {
    //                     key: 'Access-Control-Allow-Origin',
    //                     value: process.env.NODE_ENV === 'production' 
    //                         ? 'https://magitechrpg.vercel.app'
    //                         : '*'
    //                 },
    //                 {
    //                     key: 'Access-Control-Allow-Methods',
    //                     value: 'GET, POST, PUT, DELETE, OPTIONS'
    //                 },
    //                 {
    //                     key: 'Access-Control-Allow-Headers',
    //                     value: 'Content-Type, Authorization'
    //                 },
    //                 {
    //                     key: 'Access-Control-Allow-Credentials',
    //                     value: 'true'
    //                 }
    //             ]
    //         }
    //     ]
    // },
    webpack(config) {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true
        }
        return config
    }
}

module.exports = withPWA(nextConfig)
