import { CreateCustomItemDTO } from '@models/dtos';
import type { Campaign } from '@models/entities/Campaign';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function DELETE(req: Request, { params }: { params: { id: string, ItemId: string } }) {
    try {
        const { id, ItemId } = params;
        const body = await req.json();

        const dto = plainToInstance(CreateCustomItemDTO, { type: body.type || body }, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true, whitelist: false });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const { type } = body;
        const campaign = await findCampaignByCodeOrId(id);

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
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
    } catch (error: any) {
        console.error('Erro ao excluir item customizado:', error);
        return Response.json({ 
            message: 'Erro ao excluir item customizado', 
            error: error.message 
        }, { status: 500 });
    }
}