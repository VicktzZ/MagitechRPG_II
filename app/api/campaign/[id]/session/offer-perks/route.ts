import { PusherEvent } from '@enums';
import { campaignRepository } from '@repositories';
import { assertIdList, assertMaxLength, forbidden, handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';
import { pusherServer } from '@utils/pusher';
import type { PerkFilters } from '@models';

interface OfferPerksBody {
    userIds: string[];
    filters: PerkFilters;
    sharedSeed?: string;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(id, user);
        const body: OfferPerksBody = await readJsonBody(req);

        const userIds = assertIdList(body.userIds, 'userIds');
        assertMaxLength(body.sharedSeed, 200, 'sharedSeed');
        if (userIds.some(uid => !campaign.players?.some(p => p.userId === uid))) {
            throw forbidden('Só é possível oferecer perks a jogadores desta campanha');
        }

        // Atualiza a session com os pending users, filtros e seed compartilhada
        const updatedSession = {
            ...campaign.session,
            pendingPerkUsers: body.userIds,
            perkFilters: body.filters,
            sharedPerkSeed: body.sharedSeed || null
        };

        await campaignRepository.update({
            ...campaign,
            session: updatedSession
        });

        // Notifica os clientes via Pusher
        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.PERKS_OFFERED,
            { userIds: body.userIds, filters: body.filters, sharedSeed: body.sharedSeed }
        );

        return Response.json({ success: true, pendingPerkUsers: body.userIds, sharedSeed: body.sharedSeed });
    } catch (error) {
        return handleRouteError(error, 'Erro ao oferecer perks');
    }
}
