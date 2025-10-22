import { PusherEvent } from '@enums';
import { updateDoc } from 'firebase/firestore';
import { fichaDoc } from '@models/db/ficha';
import { pusherServer } from '@utils/pusher';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const body = await req.json();
    const fichaId = body._id;
    delete body._id
    
    const { id: code } = params;
    
    await updateDoc(fichaDoc(fichaId ?? ''), body);

    await pusherServer.trigger('presence-' + code, PusherEvent.FICHA_UPDATED, { ...body, _id: fichaId });

    console.log(body)
    return Response.json({ message: 'SUCCESS' });
}