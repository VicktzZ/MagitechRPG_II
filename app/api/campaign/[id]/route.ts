import { campaignRepository } from '@repositories';
import { CampaignDTO } from '@models/dtos/CampaignDTO';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import type { Campaign } from '@models/entities/Campaign';

export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const { id } = params;

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json(campaign);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}
 
export async function DELETE(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const { id } = params;
        const campaign = await findCampaignByCodeOrId(id);

        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        await campaignRepository.delete(campaign.id);
        
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const { id } = params;
        const body: CampaignDTO = await req.json();

        const dto = plainToInstance(CampaignDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        await campaignRepository.update({ ...dto, id } as Campaign);
        
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}