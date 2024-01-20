import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';

import { connectToDb } from '@utils/database';
import { type User as UserType } from '@types';
import User from '@models/user';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),

        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET
        })
    ],

    callbacks: {
        session: async ({ session }: { session: any }) => {
            const sessionUser = await User.findOne<UserType>({ email: session?.user?.email })

            session.user._id = String(sessionUser?._id)
            session.user.email = String(sessionUser?.email)
            session.user.name = String(sessionUser?.name)
            session.user.image = String(sessionUser?.image)
    
            return session
        },
        
        signIn: async ({ profile }) => {
            try {
                await connectToDb()

                const p: any = profile

                console.log(p);
    
                const userExists = await User.findOne({
                    email: profile?.email
                })
    
                if (!userExists) {
                    await User.create({
                        email: profile?.email?.toLowerCase(),
                        name: profile?.name?.replace(' ', '').toLowerCase() ?? p?.username?.replace(' ', '').toLowerCase(),
                        image: p?.picture ?? p?.image_url
                    })
                }
    
                return true
            } catch (error) {
                console.log(error)
    
                return false
            }
        }
    }
})

export { handler as GET, handler as POST }