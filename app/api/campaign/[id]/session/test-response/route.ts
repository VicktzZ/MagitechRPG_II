import { forbidden, handleRouteError, isValidId, readJsonBody, requireCampaignMember, requireUser } from '@utils/api';
import { buildTestResponse } from '@utils/api/campaignTests';
import type { ActiveTest, TestResponse } from '@models/types/session';
import { adminUpdateDocInTransaction } from '@utils/firestore/adminDocs';

/**
 * POST /api/campaign/[id]/session/test-response — o jogador chamado envia os d20 que
 * rolou e o bônus; o servidor confere o pedido, refaz a conta e grava a resposta em
 * `session.testRequest.responses.<userId>`. A conferência e a gravação são uma transação:
 * um novo pedido do mestre no meio do caminho não recebe a resposta do teste anterior.
 */
export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign, isGM } = await requireCampaignMember(params.id, user);

        if (isGM) throw forbidden('O mestre não responde aos próprios testes');
        if (campaign.status === 'finished') throw forbidden('Campanha finalizada');
        // O ID entra no caminho do campo: nada de pontos ou barras
        if (!isValidId(user.id)) throw forbidden('Usuário inválido');

        const body = await readJsonBody(req);

        const response = await adminUpdateDocInTransaction<TestResponse, { session?: { testRequest?: ActiveTest } }>('campaigns', campaign.id, (data) => {
            const result = buildTestResponse(body, {
                request: data?.session?.testRequest,
                user: { id: user.id, name: user.name },
                now: new Date()
            });

            return {
                fields: { [`session.testRequest.responses.${user.id}`]: result },
                result
            };
        });

        return Response.json({ success: true, response });
    } catch (error) {
        return handleRouteError(error, 'Erro ao registrar o teste');
    }
}
