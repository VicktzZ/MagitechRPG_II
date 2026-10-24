import { assertCombatantVitalsBody } from '@utils/api/combatantStats';
import { handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';
import { adjustCombatantVitals } from '@utils/firestore/combatantStats';

/**
 * POST /api/campaign/[id]/combat/vitals — body: { combatantId, lp?: -5, mp?: 3 }
 *
 * Soma variações à vida e à mana de uma criatura em combate (negativo = dano ou gasto), de 0 até o máximo, numa
 * transação: serve ao dano e à cura rápidos do mestre sem perder cliques seguidos. Só o mestre da campanha; jogadores
 * em combate têm a vida na ficha (`POST /api/charsheet/[id]/stats`).
 */
export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(params.id, user);
        const { combatantId, deltas } = assertCombatantVitalsBody(await readJsonBody(req));

        const changes = await adjustCombatantVitals(campaign.id, combatantId, deltas);

        return Response.json({ message: 'SUCCESS', changes });
    } catch (error) {
        return handleRouteError(error, 'Erro ao ajustar a criatura em combate');
    }
}
