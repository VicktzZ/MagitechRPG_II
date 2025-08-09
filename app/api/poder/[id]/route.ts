import Poder from '@models/db/poder';
import type { MagicPower } from '@types';
import { connectToDb } from '@utils/database';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb()

        const poder = await Poder.findById(id)

        if (!poder) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json(poder)
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 })
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb()
        
        const poder = await Poder.findByIdAndDelete(id)

        if (!poder) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json({ deletedFicha: poder, message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb()
        
        const body: MagicPower = await req.json()
        const poder = await Poder.findByIdAndUpdate<MagicPower>(id, body)

        if (!poder) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json({ updatedFicha: poder, message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}