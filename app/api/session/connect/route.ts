import Campaign from '@models/db/campaign';
import Ficha from '@models/db/ficha';
import type { Campaign as CampaignType, Ficha as FichaType, SessionInfo } from '@types';
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
                    return Response.json({ message: 'Erro ao adicionar jogador' }, { status: 500 });
                }

                // Adiciona SessionInfo na ficha se ainda não existir para esta campanha
                const sessionInfo: SessionInfo = {
                    campaignCode,
                    attributes: {
                        maxLp: userFicha.attributes.lp,
                        maxMp: userFicha.attributes.mp
                    }
                }

                if (!userFicha.session) {
                    await Ficha.findByIdAndUpdate(
                        fichaId,
                        { $set: { session: [ sessionInfo ] } }
                    );
                } else {
                    // Verifica se já existe uma sessão para esta campanha
                    const hasSession = userFicha.session?.some(s => s.campaignCode === campaignCode) ?? false
    
                    if (!hasSession) {
                        await Ficha.findByIdAndUpdate(
                            fichaId,
                            {
                                $push: {
                                    session: sessionInfo
                                }
                            }
                        )
                    }
                }

                // Notifica os outros usuários
                await pusherServer.trigger(
                    campaignCode,
                    PusherEvent.USER_ENTER,
                    {
                        userId,
                        name: userFicha.name,
                        _id: fichaId,
                        currentFicha: userFicha
                    }
                );
            }
        }

        return Response.json({ campaign });
    } catch (error) {
        console.error('Erro ao conectar à sessão:', error);
        return Response.json({ message: 'Erro ao conectar à sessão' }, { status: 500 });
    }
}