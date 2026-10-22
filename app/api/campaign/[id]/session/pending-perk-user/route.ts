import { PusherEvent } from '@enums';
import type { Campaign } from '@models/entities';
import { assertId, forbidden, handleRouteError, readJsonBody, requireCampaignMember, requireUser } from '@utils/api';
import { triggerPusher } from '@utils/pusher';
import { adminUpdateDocInTransaction } from '@utils/firestore/adminDocs';

interface RemovePendingUserBody {
    userId: string;
}

// Usando POST em vez de DELETE porque axios não envia body corretamente em DELETE
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = await requireUser();
        const { campaign, isGM } = await requireCampaignMember(id, user);
        const body: RemovePendingUserBody = await readJsonBody(req);

        if (!body.userId) {
            return Response.json({ message: 'UserId é obrigatório' }, { status: 400 });
        }
        assertId(body.userId, 'userId');

        // Jogador só sai da própria pendência (após escolher o perk); o mestre, de qualquer um
        if (!isGM && body.userId !== user.id) {
            throw forbidden('Você só pode concluir a sua própria escolha de perks');
        }

        // Remove o usuário da lista de pendentes dentro de uma transação: vários jogadores concluem a
        // escolha ao mesmo tempo, e cada um precisa ver a lista que o outro acabou de gravar
        const updatedPending = await adminUpdateDocInTransaction<string[], Campaign>('campaigns', campaign.id, data => {
            const remaining = (data?.session?.pendingPerkUsers ?? []).filter(uid => uid !== body.userId);
            return {
                fields: {
                    'session.pendingPerkUsers': remaining,
                    // Limpa os filtros quando não sobra ninguém pendente (null: o Firestore não aceita undefined)
                    ...(remaining.length === 0 ? { 'session.perkFilters': null } : {})
                },
                result: remaining
            };
        });

        // Notifica os clientes via Pusher
        await triggerPusher(
            `presence-${campaign.campaignCode}`,
            PusherEvent.PERK_USER_COMPLETED,
            { userId: body.userId, remainingUsers: updatedPending }
        );

        return Response.json({ success: true, remainingUsers: updatedPending });
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover usuário pendente');
    }
}
