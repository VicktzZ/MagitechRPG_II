import { PusherEvent } from '@enums';
import { assertIdList, assertMaxLength, forbidden, handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';
import { triggerPusher } from '@utils/pusher';
import { adminUpdateDoc } from '@utils/firestore/adminDocs';
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

        // Só os campos da oferta (caminhos de campo): não regrava a campanha inteira
        await adminUpdateDoc('campaigns', campaign.id, {
            'session.pendingPerkUsers': userIds,
            'session.perkFilters': body.filters ?? null,
            'session.sharedPerkSeed': body.sharedSeed || null
        });

        // Notifica os clientes via Pusher
        await triggerPusher(
            `presence-${campaign.campaignCode}`,
            PusherEvent.PERKS_OFFERED,
            { userIds, filters: body.filters, sharedSeed: body.sharedSeed }
        );

        return Response.json({ success: true, pendingPerkUsers: userIds, sharedSeed: body.sharedSeed });
    } catch (error) {
        return handleRouteError(error, 'Erro ao oferecer perks');
    }
}
