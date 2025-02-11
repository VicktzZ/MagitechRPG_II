import { PusherEvent } from '@enums';
import Campaign from '@models/campaign';
import type { Campaign as CampaignType } from '@types';
import { connectToDb } from '@utils/database';
import { pusherServer } from '@utils/pusher';

export async function POST(req: Request): Promise<Response> {
    try {
        await connectToDb();

        const { campaignCode, userId }: { campaignCode: string; userId: string } = await req.json();

        const updatedCampaign: CampaignType | null = await Campaign.findOneAndUpdate(
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

        // Envia apenas os dados necessários via Pusher
        const userInfo = updatedCampaign.players.find(p => p.userId === userId);
        await pusherServer.trigger(
            'presence-' + campaignCode,
            PusherEvent.USER_EXIT,
            {
                userId,
                userName: userInfo?.userId ?? 'Unknown',
                timestamp: new Date()
            }
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
