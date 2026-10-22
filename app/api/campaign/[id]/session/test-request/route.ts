import { randomUUID } from 'crypto';
import { forbidden, handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';
import { buildTestRequest } from '@utils/api/campaignTests';
import { adminUpdateDoc } from '@utils/firestore/adminDocs';

/**
 * POST /api/campaign/[id]/session/test-request — o mestre pede um teste (DT, perícia,
 * quem responde). O pedido fica em `session.testRequest`, que os jogadores recebem pelo
 * listener da campanha; um novo pedido substitui o anterior e zera as respostas.
 */
export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(params.id, user);

        if (campaign.status === 'finished') {
            throw forbidden('Campanha finalizada — não é possível pedir testes');
        }

        const request = buildTestRequest(await readJsonBody(req), {
            campaign,
            requestedBy: { id: user.id, name: user.name },
            id: randomUUID(),
            now: new Date()
        });

        // Caminho de campo: só `session.testRequest` muda, o resto da sessão (chat, combate) fica como está
        await adminUpdateDoc('campaigns', campaign.id, { 'session.testRequest': request });

        return Response.json({ success: true, request });
    } catch (error) {
        return handleRouteError(error, 'Erro ao pedir o teste');
    }
}
