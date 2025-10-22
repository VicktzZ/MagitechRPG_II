import { updateDoc, arrayUnion } from 'firebase/firestore';
import { campaignDoc } from '@models/db/campaign';
import { pusherServer } from '@utils/pusher';
import { PusherEvent } from '@enums';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const { id } = params;
        const body = await req.json();
        const { type, item } = body || {};

        if (!type || !item || ![ 'weapon','armor','item' ].includes(type)) {
            return Response.json({ message: 'Parâmetros inválidos' }, { status: 400 });
        }

        const itemWithId = {
            ...item,
            _id: `${type}-${uuidv4()}`
        };

        // Adicionar item usando arrayUnion
        await updateDoc(campaignDoc(id), {
            [`custom.items.${type}`]: arrayUnion(itemWithId)
        });

        await pusherServer.trigger(
            `presence-${id}`,
            PusherEvent.ITEM_ADDED,
            { type, item: itemWithId }
        );

        return Response.json(itemWithId);
    } catch (error: any) {
        console.error('Erro ao adicionar item customizado:', error);
        return Response.json({ 
            message: 'Erro ao adicionar item customizado', 
            error: error.message 
        }, { status: 500 });
    }
}