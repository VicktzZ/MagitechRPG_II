declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_FIREBASE_APIKEY: string
            NEXT_PUBLIC_FIREBASE_AUTHDOMAIN: string
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
            NEXT_PUBLIC_FIREBASE_STORAGEBUCKET: string
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
            NEXT_PUBLIC_FIREBASE_APP_ID: string
            NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string
            FIREBASE_CLIENT_EMAIL: string
            FIREBASE_PRIVATE_KEY: string
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
