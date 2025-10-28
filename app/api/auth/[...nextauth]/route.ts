import { userRepository } from '@repositories';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import NextAuth from 'next-auth/next';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import { AdminProvider } from './adminProvider';
import { User } from '@models/entities';

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
        maxAge: 7 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60
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
                const sessionUser = await userRepository
                    .whereEqualTo('email', session?.user?.email)
                    .findOne();

                if (sessionUser) {
                    session.user = {
                        id: String(sessionUser.id),
                        email: String(sessionUser.email),
                        name: String(sessionUser.name),
                        image: String(sessionUser.image),
                        token
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
                const p: any = profile ?? user;
                const email = p?.email?.toLowerCase();
                
                const existingUser = await userRepository
                    .whereEqualTo('email', email)
                    .findOne();

                const newImage = p?.picture ?? p?.image_url;

                if (existingUser) {
                    if (existingUser.image !== newImage) {
                        await userRepository.update({
                            ...existingUser,
                            image: newImage
                        });
                    }
                    return true;
                }

                const newUser = new User()
                newUser.email = email;
                newUser.name = p?.name?.replace(' ', '').toLowerCase() ?? p?.username?.replace(' ', '').toLowerCase();
                newUser.image = newImage;
                newUser.charsheets = [];

                await userRepository.create(newUser);

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