import { campaignRepository, charsheetRepository } from '@repositories';
import { FieldValue } from 'firebase-admin/firestore';
import { pusherServer } from '@utils/pusher';
import { PusherEvent } from '@enums';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { getCollectionDoc } from '@models/docs';
import { updateDoc } from '@node_modules/@firebase/firestore/dist';
import { JoinCampaignDTO } from '@models/dtos';
import type { SessionInfo } from '@models/types/misc';

export async function POST(req: Request): Promise<Response> {
    try {
        const body = await req.json();
        const dto = plainToInstance(JoinCampaignDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const { campaignCode, userId, isGM } = dto;

        let campaign = await campaignRepository.whereEqualTo('campaignCode', campaignCode).findOne();
        if (!campaign) { 
            return Response.json({ message: 'Campanha não encontrada' }, { status: 400 });
        }

        const campaignDocRef = getCollectionDoc('campaigns', campaign.id);
        const updatePayload: Record<string, any> = {};

        if (!campaign.session.users.includes(userId)) {
            updatePayload['session.users'] = FieldValue.arrayUnion(userId);
        }

        if (!isGM) {
            const userCharsheet = await charsheetRepository.whereEqualTo('userId', userId).findOne();
            if (!userCharsheet) {
                return Response.json({ message: 'Charsheet não encontrada' }, { status: 400 });
            }

            const { id: charsheetId } = userCharsheet;
            const isPlayer = campaign.players?.some(player => player.userId === userId);

            if (!isPlayer) {
                updatePayload['players'] = FieldValue.arrayUnion({ userId, charsheetId });
            }

            const sessionInfo: SessionInfo = {
                campaignCode,
                stats: {
                    maxLp: userCharsheet.stats.maxLp,
                    maxMp: userCharsheet.stats.maxMp
                }
            };

            await updateDoc(getCollectionDoc('charsheets', charsheetId), {
                session: FieldValue.arrayUnion(sessionInfo)
            });

            await pusherServer.trigger(
                campaignCode,
                PusherEvent.USER_ENTER,
                {
                    userId,
                    name: userCharsheet.name,
                    id: charsheetId,
                    currentCharsheet: userCharsheet
                }
            );
        }

        if (Object.keys(updatePayload).length > 0) {
            await updateDoc(campaignDocRef, updatePayload);
            campaign = await campaignRepository.findById(campaign.id);
        }

        return Response.json({ campaign });
    } catch (error: any) {
        console.error('Erro ao conectar à sessão:', error);
        return Response.json({ message: 'Erro ao conectar à sessão', error: error.message }, { status: 500 });
    }
}