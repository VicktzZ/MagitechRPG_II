import Campaign from '@models/campaign';
import { connectToDb } from '@utils/database';

interface id { id: string }
interface CampaignType { campaignCode: string; admin: string[] }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb();

        const ficha = await Campaign.findById(id);

        if (!ficha) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json(ficha);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb();
        
        const ficha = await Campaign.findByIdAndDelete(id);

        if (!ficha) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json({ deletedFicha: ficha, message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await connectToDb();
        
        const body: CampaignType = await req.json();
        const ficha = await Campaign.findByIdAndUpdate<CampaignType>(id, body);

        if (!ficha) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json({ updatedFicha: ficha, message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}