import Campaign from '@models/campaign';
import { connectToDb } from '@utils/database';
import type { Campaign as CampaignType } from '@types';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        await connectToDb();
        let response;

        const campaignCode = req.nextUrl.searchParams.get('code');
        const userId = req.nextUrl.searchParams.get('userId');

        if (campaignCode) {
            response = await Campaign.findOne({ campaignCode });
        } else if (userId) {
            const campaignAsPlayer = await Campaign.find({ 'players.userId': userId });
            const campaignAsGM = await Campaign.find({ admin: userId });
            
            response = [ ...campaignAsPlayer, ...campaignAsGM ];
            
        } else {
            
            response = await Campaign.find();
        }
        
        return Response.json(response);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await connectToDb();
        
        const campaignBody: CampaignType = await req.json();
        const campaign = await Campaign.create<CampaignType>(campaignBody);

        return Response.json(campaign);
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}   