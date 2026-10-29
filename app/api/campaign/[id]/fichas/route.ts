/* eslint-disable @typescript-eslint/promise-function-async */
import { charsheetRepository } from '@repositories';
import { chunk } from '@utils/helpers/chunk';
import { handleRouteError, requireCampaignMemberOrApiKey } from '@utils/api';

interface id { id: string }

export async function GET(req: Request, { params }: { params: id }): Promise<Response> {
    try {
        const { campaign } = await requireCampaignMemberOrApiKey(params.id, req);

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
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar fichas da campanha');
    }
}
