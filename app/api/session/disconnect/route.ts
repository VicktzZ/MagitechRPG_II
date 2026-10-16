import { PusherEvent } from '@enums';
import { campaignRepository, charsheetRepository } from '@repositories';
import { pusherServer } from '@utils/pusher';
import { findCampaignOrThrow, getCampaignRole, handleRouteError, readJsonBody, requireUser, toCampaignPreview } from '@utils/api';

export async function POST(req: Request): Promise<Response> {
    try {
        const user = await requireUser();
        const body = await readJsonBody<{ campaignCode?: unknown }>(req);

        // Só é possível desconectar a si mesmo — userId do body é ignorado
        const userId = user.id;
        const campaign = await findCampaignOrThrow(String(body.campaignCode ?? ''));

        await campaignRepository.update({
            ...campaign,
            session: {
                ...campaign.session,
                users: campaign.session.users.filter(u => u !== userId)
            }
        });

        const updatedCampaign = await findCampaignOrThrow(campaign.campaignCode);

        const userInfo = updatedCampaign.players.find(p => p.userId === userId);
        let userName = 'Unknown';

        if (userInfo) {
            const userSheet = await charsheetRepository.findById(userInfo.charsheetId);
            if (userSheet) userName = userSheet.name;
        }

        await pusherServer.trigger(
            'presence-' + campaign.campaignCode,
            PusherEvent.USER_EXIT,
            {
                userId,
                userName,
                timestamp: new Date().toISOString()
            }
        );

        return Response.json(
            getCampaignRole(updatedCampaign, user).isMember ? updatedCampaign : toCampaignPreview(updatedCampaign),
            { status: 200 }
        );
    } catch (error) {
        return handleRouteError(error, 'Erro interno ao processar desconexão');
    }
}
