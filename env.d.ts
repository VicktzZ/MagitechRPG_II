declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB_URI: string
            MONGO_ATLAS_PUBLIC_KEY: string
            MONGO_ATLAS_PRIVATE_KEY: string
            MONGO_ATLAS_PROJECT_ID: string
            MONGO_ATLAS_CLUSTER_NAME: string
            GOOGLE_CLIENT_ID: string
            GOOGLE_CLIENT_SECRET: string
            DISCORD_CLIENT_ID: string
            DISCORD_CLIENT_SECRET: string
            NEXTAUTH_SECRET: string
            NEXTAUTH_URL: string
            NEXTAUTH_URL_INTERNAL: string
            SOCKET_SERVER_PORT: string
            PUSHER_APP_ID: string
            PUSHER_SECRET: string
            NEXT_PUBLIC_PUSHER_KEY: string
            NEXT_PUBLIC_API_KEY: string
            NEXT_PUBLIC_REALM_APP_ID: string
            PUSHER_CLUSTER: string
            NODE_ENV: 'development' | 'production'
            ADMIN_PASSWORD: string
            ADMIN_EMAIL: string
            PUSHER_KEY: string
        }
    }
}

export {}
