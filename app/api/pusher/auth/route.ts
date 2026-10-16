import { pusherServer } from '@utils/pusher';
import type { NextRequest } from 'next/server';
import { badRequest, findCampaignOrThrow, forbidden, getCampaignRole, handleRouteError, readTextBody, requireUser } from '@utils/api';

/** Canais de campanha: presence-<código> ou private-<código> */
const CAMPAIGN_CHANNEL = /^(presence|private)-([A-Za-z0-9]{8})$/;
const SOCKET_ID = /^\d+\.\d+$/;

/**
 * Autoriza a inscrição em canais privados/presence do Pusher.
 * Só membros da campanha entram no canal dela, e a identidade no canal vem
 * da sessão — o parâmetro `session` da query string (enviado pelo cliente)
 * é ignorado, senão qualquer um poderia se apresentar como outra pessoa.
 */
export async function POST(req: NextRequest): Promise<Response> {
    try {
        const user = await requireUser();

        // Corpo application/x-www-form-urlencoded: socket_id=...&channel_name=...
        const form = new URLSearchParams(await readTextBody(req, 16 * 1024));
        const socketId = form.get('socket_id') ?? form.get('socketid') ?? '';
        const channelName = form.get('channel_name') ?? '';

        if (!SOCKET_ID.test(socketId)) throw badRequest('socket_id inválido');
        const match = CAMPAIGN_CHANNEL.exec(channelName);
        if (!match) throw forbidden('Canal não permitido');

        const campaign = await findCampaignOrThrow(match[2]);
        if (!getCampaignRole(campaign, user).isMember) {
            throw forbidden('Você não participa desta campanha');
        }

        const channelAuthResponse = match[1] === 'presence'
            ? pusherServer.authorizeChannel(socketId, channelName, {
                user_id: user.id,
                user_info: { id: user.id, name: user.name, image: user.image }
            })
            : pusherServer.authorizeChannel(socketId, channelName);

        return Response.json(channelAuthResponse);
    } catch (error) {
        return handleRouteError(error, 'Erro ao autorizar canal');
    }
}
