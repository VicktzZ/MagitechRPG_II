import User from '@models/user'
import { type User as UserType } from '@types'

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await User.findById<UserType>(id)

        if (!user) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json(user)
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const body: UserType = await req.json()
        const user = await User.findByIdAndUpdate<UserType>(id, body)

        if (!user) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json({ updatedUser: user, message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await User.findByIdAndDelete<UserType>(id)

        if (!user) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json({ deletedUser: user, message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}