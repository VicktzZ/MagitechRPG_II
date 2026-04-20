import { PusherEvent } from '@enums';
import { JoinCampaignDTO } from '@models/dtos';
import type { SessionInfo } from '@models/types/misc';
import { campaignRepository, charsheetRepository } from '@repositories';
import { pusherServer } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function POST(req: Request): Promise<Response> {
    try {
        const body: JoinCampaignDTO = await req.json();
        const dto = plainToInstance(JoinCampaignDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const { campaignCode, userId, isGM, charsheetId } = body;

        let campaign = await campaignRepository.whereEqualTo('campaignCode', campaignCode).findOne();
        if (!campaign) { 
            return Response.json({ message: 'Campanha não encontrada' }, { status: 400 });
        }

        const updatePayload: Record<string, any> = {};

        if (!campaign.session.users.includes(userId)) {
            updatePayload['session'] = {
                ...campaign.session,
                users: [
                    ...campaign.session.users,
                    userId
                ]
            };
        }

        if (!isGM) {
            const userCharsheet = await charsheetRepository.whereEqualTo('id', charsheetId).findOne();
            if (!userCharsheet) {
                return Response.json({ message: 'Charsheet não encontrada' }, { status: 400 });
            }

            const isAlreadyPlayer = campaign.players?.some(player => player.userId === userId);

            if (!isAlreadyPlayer) {
                updatePayload['players'] = [
                    ...campaign.players,
                    { userId, charsheetId }
                ];
            }

            // Preserva os perks existentes da sessão atual
            const existingSession = userCharsheet.session.find(s => s.campaignCode === campaignCode);
            
            const sessionInfo: SessionInfo = {
                campaignCode,
                stats: {
                    maxLp: userCharsheet.stats.maxLp,
                    maxMp: userCharsheet.stats.maxMp,
                    maxAp: userCharsheet.stats.maxAp,
                    lp: existingSession?.stats.lp ?? userCharsheet.stats.lp,
                    mp: existingSession?.stats.mp ?? userCharsheet.stats.mp,
                    ap: existingSession?.stats.ap ?? userCharsheet.stats.ap
                },
                perks: existingSession?.perks || [] // Preserva os perks adquiridos, usa array vazio se não houver
            };

            const userSession = [ ...userCharsheet.session.filter(s => s.campaignCode !== campaignCode), sessionInfo ];

            await charsheetRepository.update({
                ...userCharsheet,
                session: userSession
            });

            await pusherServer.trigger(
                `presence-${campaignCode}`,
                PusherEvent.USER_ENTER,
                {
                    userId,
                    name: userCharsheet.name,
                    id: charsheetId
                }
            );
        }

        if (Object.keys(updatePayload).length > 0) {
            await campaignRepository.update({
                ...campaign,
                ...updatePayload
            });
        }

        if (isGM) {
            campaign = await campaignRepository.whereEqualTo('campaignCode', campaignCode).findOne();
        }

        return Response.json({ campaign });
    } catch (error: any) {
        console.error('Erro ao conectar à sessão:', error);
        return Response.json({ message: 'Erro ao conectar à sessão', error: error.message }, { status: 500 });
    }
}