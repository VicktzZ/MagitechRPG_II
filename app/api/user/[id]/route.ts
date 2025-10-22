import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@utils/database'
import { type User as UserType } from '@types'

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const userDoc = doc(db, 'users', id)
        const user = (await getDoc(userDoc)).data() as UserType

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
        const userDoc = doc(db, 'users', id)
        await updateDoc(userDoc, { ...body })

        return Response.json({ message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const userDoc = doc(db, 'users', id)
        await deleteDoc(userDoc).catch(e => console.log(e))

        return Response.json({ message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}