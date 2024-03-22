import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';

import { connectToDb } from '@utils/database';
import type { Session } from 'next-auth';
import { type User as UserType } from '@types';
import { NODE_ENV } from '@constants';
import User from '@models/user';

const handler = NextAuth({
    providers: NODE_ENV !== 'development' ? [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),

        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET
        })
    ] : [
        CredentialsProvider({
            name: 'Admin',
            credentials: {
                username: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'admin'
                },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials, req) {
                await connectToDb()
                let user

                if (
                    credentials?.username === process.env.ADMIN_EMAIL &&
                    credentials.password === process.env.ADMIN_PASSWORD
                ) {
                    user = await User.findOne<UserType>({ email: credentials?.username })
                }

                if (user) {
                    return {
                        _id: user._id,
                        id: user._id,
                        email: user.email,
                        image: user.image,
                        name: user.name
                    }
                } else return null
            }
        })
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

        session: async ({ session }: { session: Session }) => {
            const sessionUser = await User.findOne<UserType>({
                email: session?.user?.email 
            });

            session.user._id = String(sessionUser?._id);
            session.user.email = String(sessionUser?.email);
            session.user.name = String(sessionUser?.name);
            session.user.image = String(sessionUser?.image);

            return session;
        },

        signIn: async ({ profile, user }) => {
            try {
                await connectToDb();
                const p: any = profile ?? user;

                const userExists = await User.findOne({
                    email: profile?.email
                });

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
    }
});

export { handler as GET, handler as POST };
