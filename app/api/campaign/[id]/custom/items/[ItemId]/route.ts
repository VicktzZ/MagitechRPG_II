import type { Campaign } from '@models/entities/Campaign';
import { campaignRepository } from '@repositories';
import { assertId, badRequest, handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';

const ITEM_TYPES = [ 'weapon', 'armor', 'item' ];

export async function DELETE(req: Request, { params }: { params: { id: string, ItemId: string } }) {
    try {
        const { id } = params;
        const ItemId = assertId(params.ItemId, 'ItemId');
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(id, user);

        // O cliente envia { type } ou só a string do tipo como body
        const body = await readJsonBody<{ type?: string } | string>(req);
        const type = typeof body === 'string' ? body : body?.type;

        if (!type || !ITEM_TYPES.includes(type)) {
            throw badRequest('"type" deve ser weapon, armor ou item');
        }
        
        const itemsArray = (campaign.custom?.items?.[type as keyof Campaign['custom']['items']] || []) as Array<{ id: string }>;
        const updatedItems = itemsArray.filter(item => item.id !== ItemId);

        await campaignRepository.update({
            ...campaign,
            custom: {
                ...campaign.custom,
                items: {
                    ...campaign.custom?.items,
                    [type]: updatedItems
                }
            }
        });
        
        return Response.json({ type, ItemId });
    } catch (error) {
        return handleRouteError(error, 'Erro ao excluir item customizado');
    }
}
