import Ficha from '@models/ficha';
import { type Ficha as FichaType } from '@types';
import { connectToDb } from '@utils/database';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        await connectToDb()
        const userId = req.nextUrl.searchParams.get('userId')

        console.log(userId);
        
        const fichas = await Ficha.find<FichaType>({ userId })

        return Response.json(fichas)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await connectToDb()
        
        const body: FichaType = await req.json()

        const ficha = await Ficha.create(body)

        return Response.json(ficha)
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}   