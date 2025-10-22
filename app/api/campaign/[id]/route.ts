import { updateDoc, deleteDoc } from 'firebase/firestore';
import type { Campaign as CampaignType } from '@types';
import { getCampaign } from '@utils/server/getCampaign';
interface id { id: string }

export async function GET(_req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;

        const snap = await getCampaign(id);
        if (!snap.exists()) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json(snap.data());
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(_req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;
        const snap = await getCampaign(id);
        if (!snap.exists()) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        await deleteDoc(snap.ref);
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;
        const body: CampaignType = await req.json();
        const snap = await getCampaign(id);
        if (!snap.exists()) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        await updateDoc(snap.ref, { ...body });
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}