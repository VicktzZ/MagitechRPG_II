import { campaignCollection, campaignDoc } from '@models/db/campaign';
import { where, getDocs, getDoc, query, type DocumentSnapshot } from '@firebase/firestore';

export async function getCampaign(id: string) {
    let snap: DocumentSnapshot
    if (id.length === 8) {
        const campaignQuery = query(campaignCollection, where('campaignCode', '==', id));
        const campaignResult = await getDocs(campaignQuery);
        snap = campaignResult.docs[0];
    } else {
        snap = await getDoc(campaignDoc(id));
    }
    
    return snap;
}
