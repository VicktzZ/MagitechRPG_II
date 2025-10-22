import { campaignDoc } from '@models/db/campaign';
import type { Campaign as CampaignType } from '@types';
import { getCampaign } from '@utils/server/getCampaign';
import { updateDoc } from 'firebase/firestore';

export async function DELETE(req: Request, { params }: { params: { id: string, ItemId: string } }) {
    try {
        const { id, ItemId } = params;
        const type = await req.json() as string;

        if (!type || ![ 'weapon','armor','item' ].includes(type)) {
            return Response.json({ message: 'Parâmetros inválidos' }, { status: 400 });
        }

        // Buscar campanha atual
        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        const campaign = campaignSnap.data();
        
        // Remover item do array específico
        const updatedItems = (campaign.custom?.items?.[type as keyof CampaignType['custom']['items']] || []).filter(item => item._id !== ItemId);
        await updateDoc(campaignDoc(id), {
            [`custom.items.${type}`]: updatedItems
        });

        // await pusherServer.trigger(
        //     `presence-${campaign.campaignCode}`,
        //     PusherEvent.ITEM_DELETED,
        //     { type, item }
        // );

        return Response.json({ type, ItemId });
    } catch (error: any) {
        console.error('Erro ao excluir item customizado:', error);
        return Response.json({ 
            message: 'Erro ao excluir item customizado', 
            error: error.message 
        }, { status: 500 });
    }
}