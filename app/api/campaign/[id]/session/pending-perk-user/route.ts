import { PusherEvent } from '@enums';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { pusherServer } from '@utils/pusher';

interface RemovePendingUserBody {
    userId: string;
}

// Usando POST em vez de DELETE porque axios não envia body corretamente em DELETE
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body: RemovePendingUserBody = await req.json();

        if (!body.userId) {
            return Response.json({ message: 'UserId é obrigatório' }, { status: 400 });
        }

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
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
        console.error('Erro ao remover usuário pendente:', error);
        return Response.json({ message: 'Erro ao remover usuário pendente' }, { status: 500 });
    }
}
