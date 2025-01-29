import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';

import type { Session } from 'next-auth';
import type { JWT } from '@node_modules/next-auth/jwt';
import type { User as UserType } from '@types';
import { connectToDb } from '@utils/database';
import User from '@models/user';
// import { AdminProvider } from './adminProvider';

const handler = NextAuth({
    providers:
    [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),

        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET
        })
        // AdminProvider
    ],

    callbacks: {
        redirect: ({ url, baseUrl }) => {
            if(url.startsWith(baseUrl)) {
                return url
            } else if(url.startsWith('/')) {
                return new URL(url, baseUrl).toString();
            }
            return baseUrl;
        },

        session: async ({ session, token }: { session: Session, token: JWT }) => {
            session.accessToken = token['accessToken'] as string;
            const sessionUser = await User.findOne<UserType>({
                email: session?.user?.email 
            });
            console.log(token);

            if (sessionUser !== null) {
                session.user = {
                    _id: String(sessionUser?._id),
                    email: String(sessionUser?.email),
                    name: String(sessionUser?.name),
                    image: String(sessionUser?.image)
                };
            } else if (typeof token !== typeof undefined) {
                session.token = token;
            }
            
            console.log(session);

            // session.user._id = String(sessionUser?._id);
            // session.user.email = String(sessionUser?.email);
            // session.user.name = String(sessionUser?.name);
            // session.user.image = String(sessionUser?.image);

            return session;
        },

        signIn: async ({ profile, user }) => {
            try {
                await connectToDb();
                const p: any = profile ?? user;

                const userExists = await User.findOne({
                    email: profile?.email
                });

                if (userExists) {
                    if (userExists.image !== p?.picture && userExists.image !== p?.image_url) {
                        await userExists.updateOne({
                            image: p?.picture ?? p?.image_url
                        });
                    }
                }

                if (!userExists && !user) {
                    await User.create({
                        email: profile?.email?.toLowerCase(),
                        name:
                        profile?.name?.replace(' ', '').toLowerCase() ??
                        p?.username?.replace(' ', '').toLowerCase(),
                        image: p?.picture ?? p?.image_url
                    });
                }

                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        },

        async jwt({ token, user }) {
            console.log('JWT Token User');
            console.log(token['user']);

            if (typeof user !== typeof undefined) token['user'] = user;
            return token;
        }
    }
});

export { handler as GET, handler as POST };
