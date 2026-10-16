import { pusherServer } from '@utils/pusher';
import type { EventData } from '@models/types/misc';
import type { NextRequest } from 'next/server'
import { badRequest, findCampaignOrThrow, forbidden, getCampaignRole, handleRouteError, readJsonBody, requireUser } from '@utils/api';

const CAMPAIGN_CHANNEL = /^(presence|private)-([A-Za-z0-9]{8})$/;
const EVENT_NAME = /^[A-Za-z0-9_:-]{1,100}$/;

/**
 * Dispara um evento "server-*" num canal de campanha. Só membros da campanha
 * podem disparar no canal dela (antes qualquer um disparava em qualquer canal).
 */
const handler = async (req: NextRequest): Promise<Response> => {
    try {
        const user = await requireUser();
        const eventData: EventData = await readJsonBody(req, { maxBytes: 16 * 1024 });

        const match = CAMPAIGN_CHANNEL.exec(String(eventData.channelName ?? ''));
        if (!match) throw forbidden('Canal não permitido');
        if (!EVENT_NAME.test(String(eventData.eventName ?? ''))) throw badRequest('Nome de evento inválido');

        const campaign = await findCampaignOrThrow(match[2]);
        if (!getCampaignRole(campaign, user).isMember) {
            throw forbidden('Você não participa desta campanha');
        }

        const trigger = await pusherServer.trigger(eventData.channelName, 'server-' + eventData.eventName, eventData.data)

        return Response.json({
            status: 200,
            message: 'OK',
            trigger
        })
    } catch (error) {
        return handleRouteError(error, 'Erro ao disparar evento');
    }
}

export { handler as POST }
