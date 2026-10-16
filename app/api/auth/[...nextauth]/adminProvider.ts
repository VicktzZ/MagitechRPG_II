import { timingSafeEqual } from 'crypto';
import { userRepository } from '@repositories';
import type { User } from '@models/entities';
import CredentialsProvider from 'next-auth/providers/credentials';

const adminProvider = CredentialsProvider as any;

/** Comparação em tempo constante — evita descobrir a senha medindo o tempo de resposta */
function safeEqual(provided: unknown, expected: string | undefined): boolean {
    if (typeof provided !== 'string' || !expected) return false;
    const encoder = new TextEncoder();
    const a = encoder.encode(provided);
    const b = encoder.encode(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

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

        const emailMatches = safeEqual(credentials?.username, process.env.ADMIN_EMAIL);
        const passwordMatches = safeEqual(credentials?.password, process.env.ADMIN_PASSWORD);

        if (emailMatches && passwordMatches) {
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