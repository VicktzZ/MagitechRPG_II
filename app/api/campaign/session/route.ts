import Campaign from '@models/campaign';
import type { Player } from '@types';

export async function POST(req: Request): Promise<Response> {
    const { campaignCode, player }: { campaignCode: string, player: Player } = await req.json();
    let response; 

    const isUserGM = await Campaign.findOne({ campaignCode, admin: player.userId });
    const isInSession = isUserGM?.session.includes(player.userId);

    if (isUserGM) {
        if (!isInSession) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    session: player.userId
                }
            });
    
            return Response.json({ response }, { status: 200 });
        }
    }

    const isUserFichaAlreadyInCampaign = await Campaign.findOne({ campaignCode, 'players.fichaId': player.fichaId });

    if (isUserFichaAlreadyInCampaign) {
        if (!isUserFichaAlreadyInCampaign.session.includes(player.userId)) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    session: player.userId
                }
            });
        }
    } else {
        response = await Campaign.findOneAndUpdate({ campaignCode }, {
            $push: {
                players: { userId: player.userId, fichaId: player.fichaId },
                session: player.userId
            }
        });
    }

    if (!campaignCode || !player) {
        return Response.json({ message: 'BAD REQUEST - Missing campaignCode or player' }, { status: 400 });
    }

    console.log({ isUserFichaAlreadyInCampaign, response })

    return Response.json({ message: 'User joined successfully!', response });
}

export async function PATCH(req: Request): Promise<Response> {
    const { campaignCode, playerId }: { campaignCode: string, playerId: string } = await req.json();
    const response = await Campaign.findOneAndUpdate({ campaignCode }, {
        $pull: {
            session: playerId
        }
    });

    console.log({
        message: 'User left from session!',
        session: response.session,
        players: response.players
    })

    if (!campaignCode || !playerId) { 
        return Response.json({ message: 'BAD REQUEST - Missing campaignCode or playerId' }, { status: 400 });
    }

    return Response.json({ message: 'User left from session!', response });
}

export async function DELETE(req: Request): Promise<Response> {
    const { campaignCode }: { campaignCode: string } = await req.json();
    const response = await Campaign.findOneAndDelete({ campaignCode });

    if (!campaignCode) { 
        return Response.json({ message: 'BAD REQUEST' }, { status: 400 });
    }

    return Response.json({ message: 'User left successfully!', response });
}