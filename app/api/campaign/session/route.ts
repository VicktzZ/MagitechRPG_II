import Campaign from '@models/campaign';
import { pusherServer } from '@utils/pusher';

export async function POST(req: Request): Promise<Response> {
    let response; 
    
    const { campaignCode, playerId, isGM }: { campaignCode: string, playerId: string, isGM: boolean } = await req.json();
    const campaign = await Campaign.findOne({ campaignCode });

    if (!campaign) { 
        return Response.json({ message: 'BAD REQUEST - Campaign not found' }, { status: 400 });
    }

    if (isGM) {
        if (!campaign.session.admins.includes(playerId)) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    'session.admins': playerId
                }
            });
        } else response = campaign
    } else {
        if (!campaign.session.players.includes(playerId)) {
            response = await Campaign.findOneAndUpdate({ campaignCode }, {
                $push: {
                    'session.players': playerId
                }
            });
        } else response = campaign
    }

    console.log({ message: 'User joined successfully!', response })

    response = !response ? campaign : response;

    console.log(response)
    
    await pusherServer.trigger('presence-' + campaignCode, 'update-campaign', response);
    return Response.json(response, { status: 200 });
}

export async function DELETE(req: Request): Promise<Response> {
    const { campaignCode, playerId }: { campaignCode: string, playerId: string } = await req.json();
    const response = await Campaign.findOneAndUpdate({ campaignCode }, {
        $pull: {
            'session.admins': playerId,
            'session.players': playerId
        }
    });

    if (!campaignCode || !playerId) { 
        return Response.json({ message: 'BAD REQUEST - Missing campaignCode or playerId' }, { status: 400 });
    }

    console.log({ message: 'User left successfully!', response })

    await pusherServer.trigger('presence-' + campaignCode, 'update-campaign', response);
    return Response.json(response, { status: 200 });
}