import Campaign from '@models/campaign';
import type { Player } from '@types';
import { pusherServer } from '@utils/pusher';

export async function POST(req: Request): Promise<Response> {
    let response; 
    
    const { campaignCode, player }: { campaignCode: string, player: Player } = await req.json();
    const isUserGM = await Campaign.findOne({ campaignCode, admin: player.userId });
    const isUserFichaAlreadyInCampaign = await Campaign.findOne({ campaignCode, 'players.fichaId': player.fichaId });

    const isInSession = {
        admin: isUserGM?.session.includes(player.userId),
        player: isUserFichaAlreadyInCampaign?.session.includes(player.userId)
    }

    if (isUserGM) {
        if (!isInSession.admin) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    session: player.userId
                }
            });
        } else response = isUserGM
    } else {
        if (!isUserFichaAlreadyInCampaign) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    players: { userId: player.userId, fichaId: player.fichaId },
                    session: player.userId
                }
            });
        } else if (!isInSession.player) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    session: player.userId
                }
            });
        } else response = isUserFichaAlreadyInCampaign
    }

    console.log({ message: 'User joined successfully!', response })
    
    await pusherServer.trigger('presence-' + campaignCode, 'update-campaign', response);
    return Response.json(response, { status: 200 });
}

export async function DELETE(req: Request): Promise<Response> {
    const { campaignCode, playerId }: { campaignCode: string, playerId: string } = await req.json();
    const response = await Campaign.findOneAndUpdate({ campaignCode }, {
        $pull: {
            session: playerId
        }
    });

    if (!campaignCode || !playerId) { 
        return Response.json({ message: 'BAD REQUEST - Missing campaignCode or playerId' }, { status: 400 });
    }

    console.log({ message: 'User left successfully!', response })

    await pusherServer.trigger('presence-' + campaignCode, 'update-campaign', response);
    return Response.json(response, { status: 200 });
}