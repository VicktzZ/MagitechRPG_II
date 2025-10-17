import { connectToDb } from '@utils/database'
import Campaign from '@models/db/campaign'
// import { pusherServer } from '@utils/pusher'
// import { PusherEvent } from '@enums'

export async function DELETE(req: Request, { params }: { params: { id: string, weaponId: string } }) {
    try {
        await connectToDb();
        const { id, weaponId } = params;
        const type = await req.json() as string;

        if (!type || ![ 'weapon','armor','item' ].includes(type)) {
            return Response.json({ message: 'Parâmetros inválidos' }, { status: 400 });
        }

        const campaign = await Campaign.findByIdAndUpdate(
            id,
            { $pull: { [`custom.items.${type}`]: { _id: weaponId } } },
            { new: true }
        );

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }

        // await pusherServer.trigger(
        //     `presence-${campaign.campaignCode}`,
        //     PusherEvent.ITEM_DELETED,
        //     { type, item }
        // );

        return Response.json({ type, weaponId });
    } catch (error: any) {
        console.error('Erro ao excluir item customizado:', error);
        return Response.json({ 
            message: 'Erro ao excluir item customizado', 
            error: error.message 
        }, { status: 500 });
    }
}