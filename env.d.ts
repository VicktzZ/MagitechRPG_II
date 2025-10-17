declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FIREBASE_APIKEY: string
            FIREBASE_AUTHDOMAIN: string
            FIREBASE_PROJECT_ID: string
            FIREBASE_STORAGEBUCKET: string
            FIREBASE_MESSAGING_SENDER_ID: string
            FIREBASE_APP_ID: string
            FIREBASE_MEASUREMENT_ID: string
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
            NEXT_PUBLIC_NODE_ENV: 'development' | 'production'
            PUSHER_CLUSTER: string
            ADMIN_PASSWORD: string
            ADMIN_EMAIL: string
            PUSHER_KEY: string
        }
    }
}

export {}
