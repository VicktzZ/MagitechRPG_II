import type { NextRequest } from 'next/server';
import type { Campaign as CampaignType } from '@types';
import { getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { campaignCollection } from '@models/db/campaign';
import { v4 as uuidv4 } from 'uuid';
import { getCampaign } from '@utils/server/getCampaign';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const campaignCode = req.nextUrl.searchParams.get('code');
        const userId = req.nextUrl.searchParams.get('userId');

        if (campaignCode) {
            const snap = await getCampaign(campaignCode);
            if (!snap.exists()) return Response.json({ message: 'NOT FOUND' }, { status: 404 });
            return Response.json(snap.data());
        }

        if (userId) {
            const qGM = query(campaignCollection, where('admin', 'array-contains', userId));
            const gmSnap = await getDocs(qGM);
            const asGm = gmSnap.docs.map(d => d.data())
                .map(c => ({ _id: c._id, code: c.campaignCode }));

            const allSnap = await getDocs(campaignCollection);
            const asPlayer = allSnap.docs
                .map(d => d.data())
                .filter(c => Array.isArray(c.players) && c.players.some(p => p.userId === userId))
                .map(c => ({ _id: c._id, code: c.campaignCode }));

            return Response.json({ asGm, asPlayer });
        }

        const snap = await getDocs(campaignCollection);
        const response = snap.docs.map(d => d.data());
        return Response.json(response);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const campaignBody: CampaignType = await req.json();
        const id = campaignBody._id ?? uuidv4();
        await setDoc(doc(campaignCollection, id), { ...campaignBody, _id: id });
        return Response.json({ ...campaignBody, _id: id });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}