import { handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';
import { adminUpdateDoc, assertFieldUpdates } from '@utils/firestore/adminDocs';

/**
 * PATCH /api/campaign/[id]/fields — body: { fields: { "session.combat": {...}, ... } }
 *
 * Atualização parcial da campanha pelo mestre (mesma semântica do updateDoc do
 * navegador). Clientes não escrevem mais direto em `campaigns` nas regras do
 * Firestore. Membros, código e chat têm rotas próprias e ficam protegidos aqui.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(params.id, user);

        const body = await readJsonBody<{ fields?: unknown }>(req);
        const fields = assertFieldUpdates(body.fields, {
            protectedPaths: [ 'id', 'admin', 'players', 'campaignCode', 'createdAt', 'session.messages', 'session.users' ]
        });

        await adminUpdateDoc('campaigns', campaign.id, fields);

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar campanha');
    }
}
