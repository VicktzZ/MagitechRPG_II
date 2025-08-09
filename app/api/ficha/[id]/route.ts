import Ficha from '@models/db/ficha';
import Magia from '@models/db/magia';
import Poder from '@models/db/poder';
import { type Ficha as FichaType } from '@types';
import { connectToDb } from '@utils/database';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb()
        
        const ficha = await Ficha.findById(id)
        const magics = await Magia.find({ _id: { $in: ficha?.magics } })
        const powers = await Poder.find({ _id: { $in: ficha?.skills.powers } })

        ficha.magics = magics
        ficha.skills.powers = powers.map(power => ({
            _id: power._id,
            name: power.nome,
            description: power['descrição'],
            element: power.elemento,
            mastery: power.maestria,
            type: 'Poder Mágico'
        }))

        if (!ficha) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json(ficha)
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 })
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb()
        
        const ficha = await Ficha.findByIdAndDelete(id)

        if (!ficha) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json({ deletedFicha: ficha, message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb()
        
        const body: FichaType = await req.json()
        const ficha = await Ficha.findByIdAndUpdate<FichaType>(id, body, { new: true })

        if (!ficha) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 })
        }

        return Response.json({ updatedFicha: ficha, message: 'SUCCESS' })
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}