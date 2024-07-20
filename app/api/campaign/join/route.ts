import Campaign from '@models/campaign';
import type { Player } from '@types';

export async function POST(req: Request): Promise<Response> {
    const { code: campaignCode, player }: { code: string, player: Player } = await req.json();
    let response; 

    const isUserFichaAlreadyInCampaign = await Campaign.findOne({ campaignCode, 'players.fichaId': player.fichaId });

    if (!isUserFichaAlreadyInCampaign) {
        response = await Campaign.findOneAndUpdate({ campaignCode }, {
            $push: {
                players: player
            }
        });
    }

    if (!campaignCode || !player) {
        return Response.json({ message: 'BAD REQUEST' }, { status: 400 });
    }

    return Response.json({ message: 'User joined successfully!', response });
}