import { connectToDb } from '@utils/database';
import { type User as UserType } from '@types';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@models/db/user';

const adminProvider = CredentialsProvider as any

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