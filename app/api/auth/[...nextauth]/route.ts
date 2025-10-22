import { userCollection } from '@models/db/user';
import type { JWT } from 'next-auth/jwt';
import { addDoc, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import type { Session } from 'next-auth';
import NextAuth from 'next-auth/next';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
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
        maxAge: 7 * 24 * 60 * 60, // 7 dias
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
                const userQuery = query(
                    userCollection,
                    where('email', '==', session?.user?.email),
                    limit(1)
                );
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                    const sessionUser = userSnapshot.docs[0].data();
                    session.user = {
                        _id: String(sessionUser._id),
                        email: String(sessionUser.email),
                        name: String(sessionUser.name),
                        image: String(sessionUser.image),
                        token: session.token
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

                const userQuery = query(
                    userCollection,
                    where('email', '==', p?.email),
                    limit(1)
                );
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                    const userExistsDoc = userSnapshot.docs[0];
                    const userExistsData = userExistsDoc.data();
                    const newImage = p?.picture ?? p?.image_url;

                    if (userExistsData.image !== newImage) {
                        await updateDoc(doc(userCollection, userExistsDoc.id), {
                            image: newImage
                        });
                    }
                    return true;
                }

                await addDoc(userCollection, {
                    email: p?.email?.toLowerCase(),
                    name: p?.name?.replace(' ', '').toLowerCase() ?? p?.username?.replace(' ', '').toLowerCase(),
                    image: p?.picture ?? p?.image_url,
                    fichas: []
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
