import Campaign from '@models/campaign';
import Ficha from '@models/ficha';
import type { Campaign as CampaignType } from '@types';
import { connectToDb } from '@utils/database';

interface id { id: string }

export async function GET(_req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;
        await connectToDb();

        let campaign: CampaignType;
        if (id.length === 8) {
            campaign = (await Campaign.findOne({ campaignCode: id }))!;
        } else {
            campaign = (await Campaign.findById(id))!;
        }

        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        const fichas = await Promise.all(campaign.players.map(async player => {
            const ficha = await Ficha.findById(player.fichaId);
            return ficha;
        }));

        return Response.json(fichas);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}