/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public'
})

const nextConfig = {
    reactStrictMode: false,
    poweredByHeader: false,
    productionBrowserSourceMaps: true,
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    experimental: {
        serverComponentsExternalPackages: [ 'mongoose' ],
    },
    logging: {
        fetches: {
            fullUrl: true
        }
    },
    images: {
        domains: [ 'lh3.googleusercontent.com', 'cdn.discordapp.com' ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'assets.example.com',
                port: '',
                pathname: '/account123/**'
            }
        ]
    },
    // CORS da API é tratado no middleware.ts (lista de origens permitidas).
    // Aqui ficam os cabeçalhos de segurança aplicados a todas as respostas.
    async headers() {
        const securityHeaders = [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
            // Diretivas que não afetam scripts/estilos (MUI, Firebase, Pusher seguem funcionando):
            // impede o site de ser embutido em iframes (clickjacking), <base> e plugins
            { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" }
        ]

        if (process.env.NODE_ENV === 'production') {
            securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' })
        }

        return [
            {
                source: '/:path*',
                headers: securityHeaders
            }
        ]
    },
    webpack(config) {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true
        }
        return config
    }
}

module.exports = withPWA(nextConfig)
