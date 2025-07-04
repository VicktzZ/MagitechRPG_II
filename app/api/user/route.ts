import User from '@models/user';
import { connectToDb } from '@utils/database';
import type { User as UserType } from '@types';

export async function GET() {
    try {
        await connectToDb()
        
        const users = await User.find()

        return Response.json({ users, message: 'SUCCESS' }, { status: 200 })
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 })
    }
}

export async function POST(req: Request) {
    try {
        const body: UserType = await req.json()
        const user = await User.create(body)

        return Response.json({ user, message: 'SUCCESS' }, { status: 201 })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}
