export default function useEnvironmentVariables() {

    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
    const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET
    const NEXTAUTH_URL = process.env.NEXTAUTH_URL
    const NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL_INTERNAL
    const NODE_ENV = process.env.NODE_ENV
    const MONGODB_URI = process.env.MONGODB_URI
    const HOST = process.env.HOST

    console.log(HOST);
    

    return {
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        NEXTAUTH_SECRET,
        NEXTAUTH_URL,
        NEXTAUTH_URL_INTERNAL,
        NODE_ENV,
        MONGODB_URI
    }
}