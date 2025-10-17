import Campaign from '@models/db/campaign';
import { connectToDb } from '@utils/database';

interface id { id: string }
interface CampaignType { campaignCode: string; admin: string[] }

export async function GET(_req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;
        await connectToDb();

        let campaign;
        if (id.length === 8) {
            campaign = await Campaign.findOne({ campaignCode: id });
        } else {
            campaign = await Campaign.findById(id);
        }

        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json(campaign);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(_req: Request, { params }: { params: id }): Promise<Response> {
    try {
        await connectToDb();
        let code;

        const { id } = params;
        if (id.length === 8) code = id;

        const campaign = await Campaign.findOneAndDelete(
            code ? { campaignCode: code } : { _id: id }
        );

        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json({ deletedCampaign: campaign, message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params }: { params: id }): Promise<Response> {
    try {
        await connectToDb();
        
        let code;

        const { id } = params;
        if (id.length === 8) code = id;

        const body: CampaignType = await req.json();
        const campaign = await Campaign.findOneAndUpdate<CampaignType>(
            code ? { campaignCode: code } : { _id: id },
            body,
            { new: true }
        );

        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json({ updatedCampaign: campaign, message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}