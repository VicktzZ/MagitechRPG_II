import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { CampaignDTO } from '@models/dtos';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { NextRequest } from 'next/server';
import { Campaign } from '@models/entities';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const campaignCode = req.nextUrl.searchParams.get('code');
        const userId = req.nextUrl.searchParams.get('userId');

        if (campaignCode) {
            const campaign = await findCampaignByCodeOrId(campaignCode);
            if (!campaign) {
                return Response.json({ message: 'NOT FOUND' }, { status: 404 });
            }
            return Response.json(campaign);
        }

        if (userId) {
            const asGmQuery = campaignRepository
                .whereArrayContains('admin', userId)
                .find();
            
            const allCampaignsQuery = campaignRepository.find();

            const [ gmCampaigns, allCampaigns ] = await Promise.all([ asGmQuery, allCampaignsQuery ]);

            const asGm = gmCampaigns.map(c => ({ id: c.id, code: c.campaignCode }));

            const asPlayer = allCampaigns
                .filter(c => Array.isArray(c.players) && c.players.some(p => p.userId === userId))
                .map(c => ({ id: c.id, code: c.campaignCode }));

            return Response.json({ asGm, asPlayer });
        }

        const allCampaigns = await campaignRepository.find();
        return Response.json(allCampaigns);

    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body: Campaign = await req.json();
        const dto = plainToInstance(CampaignDTO, body);
        const errors = await validate(dto);
        
        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }
        
        const newCampaign = new Campaign(dto);
        const createdCampaign = await campaignRepository.create(newCampaign);
        
        return Response.json(createdCampaign, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}