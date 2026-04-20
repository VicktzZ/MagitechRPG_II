import { userRepository } from '@repositories';
import type { User } from '@models/entities';
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
        let user: User | null = null;

        if (
            credentials?.username === process.env.ADMIN_EMAIL &&
            credentials.password === process.env.ADMIN_PASSWORD
        ) {
            user = await userRepository
                .whereEqualTo('email', credentials.username)
                .findOne();
        }

        if (user) {
            return {
                id: user.id,
                email: user.email,
                image: user.image,
                name: user.name
            };
        } else return null;
    }
});