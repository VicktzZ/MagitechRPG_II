import { PusherEvent } from '@enums';
import { campaignRepository } from '@repositories';
import { assertId, forbidden, handleRouteError, readJsonBody, requireCampaignMember, requireUser } from '@utils/api';
import { pusherServer } from '@utils/pusher';

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

        // Remove o usuário da lista de pending
        const currentPending = campaign.session?.pendingPerkUsers || [];
        const updatedPending = currentPending.filter(uid => uid !== body.userId);

        // Cria a sessão atualizada sem undefined (Firestore não aceita undefined)
        const updatedSession = {
            ...campaign.session,
            pendingPerkUsers: updatedPending,
            // Limpa os filtros se não houver mais ninguém pendente (usa null em vez de undefined)
            perkFilters: updatedPending.length === 0 ? null : (campaign.session?.perkFilters || null)
        };

        await campaignRepository.update({
            ...campaign,
            session: updatedSession
        });

        // Notifica os clientes via Pusher
        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.PERK_USER_COMPLETED,
            { userId: body.userId, remainingUsers: updatedPending }
        );

        return Response.json({ success: true, remainingUsers: updatedPending });
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover usuário pendente');
    }
}
