import { userCollection } from '@models/db/user';
import { type User as UserType } from '@types';
import { getDocs, limit, query, where } from 'firebase/firestore';
import CredentialsProvider from 'next-auth/providers/credentials';

const adminProvider = CredentialsProvider as any;

export const AdminProvider = adminProvider({
    name: 'Admin',
    credentials: {
        username: {
            label: 'Email',
            type: 'email',
            placeholder: 'admin'
        },
        password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials: { username: string, password: string }) {
        let user: UserType | null = null;

        if (
            credentials?.username === process.env.ADMIN_EMAIL &&
            credentials.password === process.env.ADMIN_PASSWORD
        ) {
            const userQuery = query(
                userCollection,
                where('email', '==', credentials.username),
                limit(1)
            );
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
                user = userSnapshot.docs[0].data();
            }
        }

        if (user) {
            return {
                _id: user._id,
                id: user._id,
                email: user.email,
                image: user.image,
                name: user.name
            };
        } else return null;
    }
});
