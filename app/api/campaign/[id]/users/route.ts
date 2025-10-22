import { userCollection } from '@models/db/user';
import { getCampaign } from '@utils/server/getCampaign';
import { getDocs, query, updateDoc, where } from 'firebase/firestore';
import type { NextRequest } from 'next/server';
interface id { id: string }

export async function GET(_req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;

        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ message: 'CAMPAIGN NOT FOUND' }, { status: 404 });
        }
        const campaign = campaignSnap.data();

        const userIds = [ ...campaign.players.map(p => p.userId), ...campaign.admin ];
        const userQuery = query(userCollection, where('_id', 'in', userIds));
        const userSnap = await getDocs(userQuery);
        const users = userSnap.docs.map(d => d.data());

        return Response.json(users);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;
        const { userId } = await req.json();

        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ message: 'CAMPAIGN NOT FOUND' }, { status: 404 });
        }
        const campaign = campaignSnap.data();

        await updateDoc(campaignSnap.ref, {
            players: campaign.players.filter(p => p.userId !== userId),
            'session.users': campaign.session.users.filter(u => u !== userId)
        });

        return Response.json({ message: 'USER REMOVED FROM CAMPAIGN' });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}
