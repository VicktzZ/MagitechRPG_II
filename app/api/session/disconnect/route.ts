import Campaign from '@models/campaign';
import { pusherServer } from '@utils/pusher';
import { PusherEvent } from '@enums';

export async function POST(req: Request): Promise<Response> {
    try {
        const { campaignCode, userId }: { campaignCode: string; userId: string } = await req.json();

        // Primeiro remove o usuário da sessão
        const updatedCampaign = await Campaign.findOneAndUpdate(
            { campaignCode },
            {
                $pull: {
                    'session.users': userId
                }
            },
            { new: true } // Retorna o documento atualizado
        );

        if (!updatedCampaign) {
            return Response.json(
                { message: 'Campanha não encontrada ou falha ao atualizar sessão' },
                { status: 400 }
            );
        }

        // Notifica outros usuários sobre a saída
        await pusherServer.trigger(
            'presence-' + campaignCode,
            PusherEvent.USER_EXIT,
            { userId }
        );

        // Notifica sobre a atualização da campanha
        await pusherServer.trigger(
            'presence-' + campaignCode,
            PusherEvent.UPDATE_CAMPAIGN,
            updatedCampaign
        );

        return Response.json(updatedCampaign, { status: 200 });
    } catch (error) {
        console.error('Erro ao desconectar usuário:', error);
        return Response.json(
            { message: 'Erro interno ao processar desconexão' },
            { status: 500 }
        );
    }
}
