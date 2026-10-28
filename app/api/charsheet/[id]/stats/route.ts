import { assertVitalDeltas, readStatsCampaignId } from '@utils/api/charsheetStats';
import { campaignHasCharsheet, findCampaignOrThrow, handleRouteError, readJsonBody, requireCharsheetAccess, requireUser } from '@utils/api';
import { combatantCeilings } from '@utils/combat/effectStats';
import { adjustCharsheetStats } from '@utils/firestore/charsheetStats';

/**
 * POST /api/charsheet/[id]/stats — body: { lp?: -5, mp?: 3, ap?: 0 }
 *
 * Soma variações a LP, MP e AP da ficha (negativo = dano ou gasto), de 0 até o máximo, numa transação:
 * serve ao dano e à cura rápidos do mestre sem apagar o que o jogador mudou ao mesmo tempo.
 * Dono da ficha e mestre de uma campanha onde ela joga (ou administrador).
 *
 * `campaignId` (opcional) diz em qual campanha a ficha está em combate: o servidor lê os efeitos dela e a cura sobe até o teto de agora (Fragilidade baixa o máximo,
 * Sobrecura e Sobremana deixam passar dele). Sem a campanha, ou fora de combate ativo, vale o máximo gravado.
 */
export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { charsheet } = await requireCharsheetAccess(params.id, user, 'write');
        const body = await readJsonBody(req);
        const deltas = assertVitalDeltas(body, { extraKeys: [ 'campaignId' ] });

        const campaignId = readStatsCampaignId(body);
        const campaign = campaignId ? await findCampaignOrThrow(campaignId) : null;
        const ceilings = campaign && campaignHasCharsheet(campaign, charsheet.id)
            ? combatantCeilings(campaign.session?.combat, charsheet.id, charsheet.stats ?? {})
            : {};

        const changes = await adjustCharsheetStats(charsheet.id, deltas, ceilings);

        return Response.json({ message: 'SUCCESS', changes });
    } catch (error) {
        return handleRouteError(error, 'Erro ao ajustar pontos vitais');
    }
}
