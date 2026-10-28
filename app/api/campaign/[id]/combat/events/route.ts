import { handleRouteError, requireCampaignGM, requireUser } from '@utils/api';
import { listCombatEvents } from '@utils/firestore/combatEvents';

/**
 * GET /api/campaign/[id]/combat/events — o histórico do combate (os últimos eventos, o mais novo primeiro), para o "Desfazer" do mestre.
 * Só o mestre da campanha: o histórico traz vida e mana de todos. Desfazer é a ação `undo` de `POST /api/campaign/[id]/combat`.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(params.id, user);

        return Response.json({ events: await listCombatEvents(campaign.id) });
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar o histórico do combate');
    }
}
