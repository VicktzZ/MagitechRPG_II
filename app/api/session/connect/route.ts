import Campaign from '@models/campaign';
import Ficha from '@models/ficha';
import type { Campaign as CampaignType, Ficha as FichaType } from '@types';
import { pusherServer } from '@utils/pusher';

export async function POST(req: Request): Promise<Response> {
    let response; 
    
    const { campaignCode, userId, isGM }: { campaignCode: string, userId: string, isGM: boolean } = await req.json();
    const campaign: CampaignType | null = await Campaign.findOne({ campaignCode });

    if (!campaign) { 
        return Response.json({ message: 'BAD REQUEST - Campaign not found' }, { status: 400 });
    }

    if (!campaign.session.users.includes(userId)) {
        response = await Campaign.findOneAndUpdate({ campaignCode }, {
            $push: {
                'session.users': userId
            }
        });
    }

    if (!isGM) {
        const userFicha: FichaType | null = await Ficha.findOne({ userId });

        if (!userFicha) {
            return Response.json({ message: 'BAD REQUEST - Ficha not found' }, { status: 400 });
        }

        const { _id: fichaId } = userFicha;

        if (!campaign.players?.map(player => player.userId).includes(userId)) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    players: { userId, fichaId }
                }
            });

            if (!response) {
                return Response.json({ message: 'BAD REQUEST - Failed to update players' }, { status: 400 });
            }
        }
    }

    response = !response ? campaign : response
    console.log({ message: 'User joined successfully!', session: response.session })

    await pusherServer.trigger('presence-' + campaignCode, 'update-campaign', response);
    return Response.json(response, { status: 200 });
}