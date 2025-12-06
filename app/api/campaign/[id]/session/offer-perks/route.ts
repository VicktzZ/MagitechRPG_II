import { PusherEvent } from '@enums';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { pusherServer } from '@utils/pusher';
import type { PerkFilters } from '@models';

interface OfferPerksBody {
    userIds: string[];
    filters: PerkFilters;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body: OfferPerksBody = await req.json();

        if (!body.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0) {
            return Response.json({ message: 'Lista de usuários é obrigatória' }, { status: 400 });
        }

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }

        // Atualiza a session com os pending users e filtros
        const updatedSession = {
            ...campaign.session,
            pendingPerkUsers: body.userIds,
            perkFilters: body.filters
        };

        await campaignRepository.update({
            ...campaign,
            session: updatedSession
        });

        // Notifica os clientes via Pusher
        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.PERKS_OFFERED,
            { userIds: body.userIds, filters: body.filters }
        );

        return Response.json({ success: true, pendingPerkUsers: body.userIds });
    } catch (error) {
        console.error('Erro ao oferecer perks:', error);
        return Response.json({ message: 'Erro ao oferecer perks' }, { status: 500 });
    }
}
