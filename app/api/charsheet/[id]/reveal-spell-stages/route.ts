import { campaignRepository } from '@repositories';
import { handleRouteError, requireCharsheetAccess, requireUser } from '@utils/api';
import { sheetSeesRevealedStages } from '@utils/spellReveal';

/**
 * GET /api/charsheet/[id]/reveal-spell-stages — { revealed: boolean }
 *
 * A ficha joga em alguma campanha cujo mestre liberou a visualização de todos os estágios das magias (`Campaign.revealSpellStages`)?
 * A ficha aberta fora da campanha usa isto; a tela da campanha lê o campo direto. Dono, mestre ou colega de campanha.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { charsheet } = await requireCharsheetAccess(params.id, user, 'read');

        const codes = [ ...new Set((charsheet.session ?? []).map(session => session.campaignCode).filter(Boolean)) ].slice(0, 20);
        const campaigns = await Promise.all(codes.map(code => campaignRepository.whereEqualTo('campaignCode', code).findOne()));

        return Response.json({ revealed: sheetSeesRevealedStages(campaigns, charsheet.id) });
    } catch (error) {
        return handleRouteError(error, 'Erro ao consultar a liberação dos estágios');
    }
}
