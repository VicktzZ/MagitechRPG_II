import { assertVitalDeltas } from '@utils/api/charsheetStats';
import { handleRouteError, readJsonBody, requireCharsheetAccess, requireUser } from '@utils/api';
import { adjustCharsheetStats } from '@utils/firestore/charsheetStats';

/**
 * POST /api/charsheet/[id]/stats — body: { lp?: -5, mp?: 3, ap?: 0 }
 *
 * Soma variações a LP, MP e AP da ficha (negativo = dano ou gasto), de 0 até o máximo, numa transação:
 * serve ao dano e à cura rápidos do mestre sem apagar o que o jogador mudou ao mesmo tempo.
 * Dono da ficha e mestre de uma campanha onde ela joga (ou administrador).
 */
export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { charsheet } = await requireCharsheetAccess(params.id, user, 'write');
        const deltas = assertVitalDeltas(await readJsonBody(req));

        const changes = await adjustCharsheetStats(charsheet.id, deltas);

        return Response.json({ message: 'SUCCESS', changes });
    } catch (error) {
        return handleRouteError(error, 'Erro ao ajustar pontos vitais');
    }
}
