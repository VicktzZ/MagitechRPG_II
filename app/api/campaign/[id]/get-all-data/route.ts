import Campaign from '@models/db/campaign';
import Ficha from '@models/db/ficha';
import User from '@models/db/user';
import type { Campaign as CampaignType } from '@types';
import { connectToDb } from '@utils/database';

interface id { id: string }

export async function POST(req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;
        await connectToDb();

        const { userId } = await req.json();

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

        const player = await Promise.all(campaign.players.map(async plyr => {
            const user = await User.findById(plyr.userId);
            return user;
        }));

        const admin = await Promise.all(campaign.admin.map(async adm => {
            const user = await User.findById(adm);
            return user;
        }));

        const result = {
            campaign,
            fichas,
            users: {
                player,
                admin,
                all: [ ...player, ...admin ]
            },
            isUserGM: campaign.admin.includes(userId)
        }

        return Response.json(result, { status: 200 });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}