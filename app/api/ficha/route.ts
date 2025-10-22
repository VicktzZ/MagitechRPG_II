import { getDocs, query, where, setDoc } from 'firebase/firestore';
import { type Ficha as FichaType } from '@types';
import type { NextRequest } from 'next/server';
import { fichaCollection, fichaDoc } from '@models/db/ficha';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const userId = req.nextUrl.searchParams.get('userId')
        if (!userId) return Response.json({ message: 'BAD REQUEST', error: 'Missing userId' }, { status: 400 })

        const q = query(fichaCollection, where('userId', '==', userId))
        const snap = await getDocs(q)
        const fichas = snap.docs.map(d => d.data())

        return Response.json(fichas)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body: FichaType = await req.json()
        const id = uuidv4()
        await setDoc(fichaDoc(id), { ...body, _id: id })

        return Response.json({ ...body, _id: id })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}   