import { handleRouteError, readJsonBody, requireCharsheetAccess, requireUser } from '@utils/api';
import { adminUpdateDoc, assertFieldUpdates } from '@utils/firestore/adminDocs';

/**
 * PATCH /api/charsheet/[id]/fields — body: { fields: { "inventory.money": 10, ... } }
 *
 * Atualização parcial de uma ficha (mesma semântica do updateDoc do navegador)
 * para quem não é o dono: o mestre editando a ficha de um jogador da campanha.
 * O dono pode escrever direto no Firestore; as regras não deixam mais ninguém.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { charsheet } = await requireCharsheetAccess(params.id, user, 'write');

        const body = await readJsonBody<{ fields?: unknown }>(req);
        const fields = assertFieldUpdates(body.fields, { protectedPaths: [ 'id', 'userId', 'createdAt', 'abilityUses' ] });

        await adminUpdateDoc('charsheets', charsheet.id, fields);

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar ficha');
    }
}
