import { PusherEvent } from '@enums';
import type { Campaign } from '@models/entities';
import { charsheetRepository } from '@repositories';
import { triggerPusher } from '@utils/pusher';
import { adminUpdateDocInTransaction } from '@utils/firestore/adminDocs';
import { disconnectFields } from '@utils/campaignPresence';
import { findCampaignOrThrow, getCampaignRole, handleRouteError, readJsonBody, requireUser, toCampaignPreview } from '@utils/api';

export async function POST(req: Request): Promise<Response> {
    try {
        const user = await requireUser();
        const body = await readJsonBody<{ campaignCode?: unknown }>(req);

        // Só é possível desconectar a si mesmo — userId do body é ignorado
        const userId = user.id;
        const campaign = await findCampaignOrThrow(String(body.campaignCode ?? ''));

        // Só `session.users` muda, dentro de uma transação: sair não reescreve a campanha inteira
        // (o que desfazia entradas e alterações simultâneas)
        await adminUpdateDocInTransaction<null, Campaign>('campaigns', campaign.id, data => ({
            fields: disconnectFields(data, userId),
            result: null
        }));

        const updatedCampaign = await findCampaignOrThrow(campaign.campaignCode);

        const userInfo = updatedCampaign.players.find(p => p.userId === userId);
        let userName = 'Unknown';

        if (userInfo) {
            const userSheet = await charsheetRepository.findById(userInfo.charsheetId);
            if (userSheet) userName = userSheet.name;
        }

        await triggerPusher(
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
