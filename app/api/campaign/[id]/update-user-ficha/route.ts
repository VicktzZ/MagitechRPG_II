import { PusherEvent } from '@enums';
import Ficha from '@models/db/ficha';
import { type Ficha as FichaType } from '@types';
import { connectToDb } from '@utils/database';
import { pusherServer } from '@utils/pusher';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const body: FichaType = await req.json();
    const fichaId = body._id;
    delete body._id
    
    const { id: code } = params;
    
    await connectToDb();
    await Ficha.findByIdAndUpdate(fichaId, body, { new: true });

    await pusherServer.trigger('presence-' + code, PusherEvent.FICHA_UPDATED, { ...body, _id: fichaId });

    console.log(body)
    return Response.json({ message: 'SUCCESS' });
}