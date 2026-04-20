/* eslint-disable @typescript-eslint/promise-function-async */
import { charsheetRepository } from '@repositories';
import { chunk } from '@utils/helpers/chunk';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';

interface id { id: string }

export async function GET(_req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        const charsheetIds = campaign.players.map(p => p.charsheetId);

        if (charsheetIds.length === 0) {
            return Response.json([]);
        }

        const idChunks = chunk(charsheetIds, 10);
        
        const queries = idChunks.map(ids => 
            charsheetRepository.whereIn('id', ids).find()
        );
        
        const results = await Promise.all(queries);
        const charsheets = results.flat();

        return Response.json(charsheets);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}