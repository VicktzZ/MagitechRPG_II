import { connectToDb } from '@utils/database'
import Campaign from '@models/db/campaign'
import { pusherServer } from '@utils/pusher'
import { PusherEvent } from '@enums'

export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        await connectToDb();
        const { id } = params;
        const body = await req.json();
        const { type, item } = body || {};

        if (!type || !item || ![ 'weapon','armor','item' ].includes(type)) {
            return Response.json({ message: 'Parâmetros inválidos' }, { status: 400 });
        }

        const campaign = await Campaign.findByIdAndUpdate(
            id,
            { $push: { [`custom.items.${type}`]: item } },
            { new: true }
        );

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }

        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.ITEM_ADDED,
            { type, item }
        );

        return Response.json(item);
    } catch (error: any) {
        console.error('Erro ao adicionar item customizado:', error);
        return Response.json({ 
            message: 'Erro ao adicionar item customizado', 
            error: error.message 
        }, { status: 500 });
    }
}
