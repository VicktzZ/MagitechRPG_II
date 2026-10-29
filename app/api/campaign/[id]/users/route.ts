/* eslint-disable @typescript-eslint/promise-function-async */
import type { Campaign } from '@models/entities';
import { userRepository } from '@repositories';
import { adminUpdateDocInTransaction } from '@utils/firestore/adminDocs';
import { chunk } from '@utils/helpers/chunk';
import { assertId, forbidden, handleRouteError, readJsonBody, requireCampaignMember, requireUser } from '@utils/api';
import type { NextRequest } from 'next/server';

interface id { id: string }

export async function GET(_req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignMember(params.id, user);

        const userIds = [ ...campaign.players.map(p => p.userId), ...campaign.admin ];

        if (userIds.length === 0) {
            return Response.json([]);
        }

        const idChunks = chunk(userIds, 10);

        const queries = idChunks.map(ids =>
            userRepository.whereIn('id', ids).find()
        );

        const results = await Promise.all(queries);

        // Só o perfil público: e-mail e dados de assinatura não são da conta dos outros membros
        const users = results.flat().map(u => ({ id: u.id, name: u.name, image: u.image }));

        return Response.json(users);
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar usuários da campanha');
    }
}

/** Remove um jogador da campanha: o mestre remove qualquer um; o jogador, só a si mesmo (sair). */
export async function DELETE(req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign, isGM } = await requireCampaignMember(params.id, user);
        const { userId } = await readJsonBody<{ userId?: unknown }>(req);
        assertId(userId, 'userId');

        if (!isGM && userId !== user.id) {
            throw forbidden('Apenas o mestre pode remover outros jogadores');
        }

        // Só `players` e `session.users`, dentro de uma transação: sair ou remover alguém não regrava a
        // campanha inteira (o que desfazia entradas e mudanças simultâneas)
        await adminUpdateDocInTransaction<null, Campaign>('campaigns', campaign.id, data => ({
            fields: {
                players: (data?.players ?? []).filter(p => p.userId !== userId),
                'session.users': (data?.session?.users ?? []).filter(u => u !== userId)
            },
            result: null
        }));

        return Response.json({ message: 'USER REMOVED FROM CAMPAIGN' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover usuário da campanha');
    }
}
