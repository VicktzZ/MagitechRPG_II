import Poder from '@models/poder';
import type { MagicPower } from '@types';
import { connectToDb } from '@utils/database';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        await connectToDb()
        const userId = req.nextUrl.searchParams.get('user')

        console.log(userId);
        
        const poderes = await Poder.find<MagicPower>(userId ? { userId } : {})

        return Response.json(poderes)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await connectToDb()
        
        const body: MagicPower = await req.json()
        const poder = await Poder.create(body)

        return Response.json(poder)
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}   