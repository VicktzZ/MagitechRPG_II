import { fichaCollection } from '@models/db/ficha';
import { getCampaign } from '@utils/server/getCampaign';
import { getDocs } from 'firebase/firestore';

interface id { id: string }

export async function GET(_req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;

        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        const campaign = campaignSnap.data();

        const allFichasSnap = await getDocs(fichaCollection);
        const fichas = allFichasSnap.docs
            .map(d => d.data())
            .filter(f => campaign.players.some(p => p.fichaId === f._id));

        return Response.json(fichas);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}