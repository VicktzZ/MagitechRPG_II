import Campaign from '@models/campaign';
import Ficha from '@models/ficha';
import type { Campaign as CampaignType, Ficha as FichaType } from '@types';
import { pusherServer } from '@utils/pusher';
import { PusherEvent } from '@enums';

export async function POST(req: Request): Promise<Response> {
    try {
        const { campaignCode, userId, isGM }: { campaignCode: string, userId: string, isGM: boolean } = await req.json();
        let campaign: CampaignType | null = await Campaign.findOne({ campaignCode });

        if (!campaign) { 
            return Response.json({ message: 'Campanha não encontrada' }, { status: 400 });
        }

        // Adiciona usuário à sessão se ainda não estiver nela
        if (!campaign.session.users.includes(userId)) {
            campaign = await Campaign.findOneAndUpdate(
                { campaignCode },
                {
                    $push: {
                        'session.users': userId
                    }
                },
                { new: true }
            );
        }

        // Se não for GM, precisa adicionar à lista de players
        if (!isGM) {
            const userFicha: FichaType | null = await Ficha.findOne({ userId });

            if (!userFicha) {
                return Response.json({ message: 'Ficha não encontrada' }, { status: 400 });
            }

            const { _id: fichaId } = userFicha;

            // Adiciona aos players se ainda não estiver na lista
            if (!campaign?.players?.map(player => player.userId).includes(userId)) {
                campaign = await Campaign.findOneAndUpdate(
                    { campaignCode },
                    {
                        $push: {
                            players: { userId, fichaId }
                        }
                    },
                    { new: true }
                );

                if (!campaign) {
                    return Response.json({ message: 'Falha ao atualizar jogadores' }, { status: 400 });
                }
            }
        }

        // Notifica sobre novo usuário
        const userInfo = campaign?.players.find(p => p.userId === userId);
        await pusherServer.trigger(
            'presence-' + campaignCode,
            'client-user-enter',
            {
                userId,
                userName: userInfo?.userId ?? 'Unknown',
                timestamp: new Date()
            }
        );

        // Notifica sobre atualização da campanha
        await pusherServer.trigger(
            'presence-' + campaignCode,
            PusherEvent.UPDATE_CAMPAIGN,
            campaign
        );

        return Response.json(campaign, { status: 200 });
    } catch (error) {
        console.error('Erro ao conectar usuário:', error);
        return Response.json(
            { message: 'Erro interno ao processar conexão' },
            { status: 500 }
        );
    }
}