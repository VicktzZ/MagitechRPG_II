import { assertCharsheetsInCampaign, handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';
import { badRequest } from '@utils/api/errors';
import { resetAbilityDayUses } from '@utils/firestore/abilityUses';

/**
 * POST /api/campaign/[id]/rest — body: { charsheetIds?: string[] } — só o mestre.
 *
 * Descanso: renova os **usos por dia** das habilidades ativadas de classe e subclasse (`abilityUses` da ficha). Sem `charsheetIds` vale para todos os jogadores da campanha.
 * Os usos por combate recomeçam sozinhos a cada combate.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
    try {
        const { id } = await params;
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(id, user);
        const body = await readJsonBody(req);

        let ids: string[];
        if (body.charsheetIds === undefined) {
            ids = (campaign.players ?? []).map(player => player.charsheetId).filter((value): value is string => typeof value === 'string' && value.length > 0);
        } else {
            if (!Array.isArray(body.charsheetIds) || body.charsheetIds.length > 50 || body.charsheetIds.some((value: unknown) => typeof value !== 'string')) {
                throw badRequest('charsheetIds deve ser uma lista de até 50 fichas');
            }
            ids = [ ...new Set<string>(body.charsheetIds) ];
            assertCharsheetsInCampaign(campaign, ids);
        }

        for (const charsheetId of ids) await resetAbilityDayUses(charsheetId);

        return Response.json({ message: 'SUCCESS', renewed: ids.length });
    } catch (error) {
        return handleRouteError(error, 'Erro ao renovar os usos por dia');
    }
}
