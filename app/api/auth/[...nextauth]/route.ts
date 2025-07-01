import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import type { Session } from 'next-auth';
import type { JWT } from '@node_modules/next-auth/jwt';
import type { User as UserType } from '@types';
import { connectToDb } from '@utils/database';
import User from '@models/user';
import { AdminProvider } from './adminProvider';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET
        }),
        ...(process.env.NODE_ENV === 'development' ? [ AdminProvider ] : [])
    ],

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        updateAge: 24 * 60 * 60 // 24 horas
    },

    callbacks: {
        redirect: ({ url, baseUrl }) => {
            if (url.startsWith(baseUrl)) {
                return url;
            } else if (url.startsWith('/')) {
                return new URL(url, baseUrl).toString();
            }
            return baseUrl;
        },

        session: async ({ session, token }: { session: Session, token: JWT }) => {
            try {
                await connectToDb();
                const sessionUser = await User.findOne<UserType>({
                    email: session?.user?.email 
                });

                if (sessionUser) {
                    session.user = {
                        _id: String(sessionUser._id),
                        email: String(sessionUser.email),
                        name: String(sessionUser.name),
                        image: String(sessionUser.image)
                    };
                }

                session.token = token;
                return session;
            } catch (error) {
                console.error('Erro ao atualizar sessão:', error);
                return session;
            }
        },

        signIn: async ({ profile, user }) => {
            try {
                await connectToDb();
                const p: any = profile ?? user;

                const userExists = await User.findOne({
                    email: p?.email
                });

                if (userExists) {
                    if (userExists.image !== p?.picture && userExists.image !== p?.image_url) {
                        await userExists.updateOne({
                            image: p?.picture ?? p?.image_url
                        });
                    }
                    return true;
                }

                await User.create({
                    email: p?.email?.toLowerCase(),
                    name: p?.name?.replace(' ', '').toLowerCase() ?? p?.username?.replace(' ', '').toLowerCase(),
                    image: p?.picture ?? p?.image_url
                });

                return true;
            } catch (error) {
                console.error('Erro no signIn:', error);
                return false;
            }
        },

        jwt: async ({ token, user }) => {
            if (user) {
                token['user'] = user;
            }
            return token;
        }
    }
});

export { handler as GET, handler as POST };
