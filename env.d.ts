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
            NODE_ENV: 'development' | 'production'
        }
    }
}

export {}