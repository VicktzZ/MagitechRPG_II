import Campaign from '@models/campaign'
import User from '@models/user'
import { connectToDb } from '@utils/database'
import type { Campaign as CampaignType } from '@types'
import type { NextRequest } from 'next/server';

interface id { id: string }

export async function GET(_req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        await connectToDb();
        let code

        const { id } = params;
        if (id.length === 8) code = id;

        const campaign: CampaignType | null = await Campaign.findOne(
            code ? { campaignCode: code } : { _id: id }
        );

        if (!campaign) return Response.json({ message: 'CAMPAIGN NOT FOUND' }, { status: 404 });

        const users = await User.find({ _id: { $in: [ ...campaign.players.map(player => player.userId), ...campaign.admin ] } });
        if (!users) return Response.json({ message: 'USERS NOT FOUND' }, { status: 404 });

        return Response.json(users);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        await connectToDb();
        let code;

        const { id } = params;
        if (id.length === 8) code = id;

        const { userId } = await req.json();
        
        const campaign = await Campaign.findOneAndUpdate(
            code ? { campaignCode: code } : { _id: id },
            { $pull: { players: { userId }, 'session.users': userId } },
            { new: true }
        );

        if (!campaign) {
            return Response.json({ message: 'CAMPAIGN NOT FOUND' }, { status: 404 });
        }

        return Response.json({ message: 'USER REMOVED FROM CAMPAIGN', campaign });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}
