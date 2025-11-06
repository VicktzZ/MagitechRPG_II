import { PusherEvent } from '@enums';
import { JoinCampaignDTO as LeaveCampaignDTO } from '@models/dtos';
import { campaignRepository, charsheetRepository } from '@repositories';
import { pusherServer } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function POST(req: Request): Promise<Response> {
    try {
        const body = await req.json();
        const dto = plainToInstance(LeaveCampaignDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true, whitelist: false });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }
        
        const { campaignCode, userId } = body;

        const campaign = await campaignRepository
            .whereEqualTo('campaignCode', campaignCode)
            .findOne();

        if (!campaign) {
            return Response.json(
                { message: 'Campanha não encontrada' },
                { status: 400 }
            );
        }

        await campaignRepository.update({
            ...campaign,
            session: {
                ...campaign.session,
                users: campaign.session.users.filter(u => u !== userId)
            }
        });

        const updatedCampaign = await campaignRepository.whereEqualTo('campaignCode', campaignCode).findOne();
        
        if (!updatedCampaign) {
            return Response.json(
                { message: 'Falha ao atualizar sessão' },
                { status: 500 }
            );
        }

        const userInfo = updatedCampaign.players.find(p => p.userId === userId);
        let userName = 'Unknown';

        if (userInfo) {
            const userSheet = await charsheetRepository.findById(userInfo.charsheetId);
            if (userSheet) userName = userSheet.name;
        }
        
        await pusherServer.trigger(
            'presence-' + campaignCode,
            PusherEvent.USER_EXIT,
            {
                userId,
                userName,
                timestamp: new Date().toISOString()
            }
        );

        return Response.json(updatedCampaign, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao desconectar usuário:', error);
        return Response.json(
            { message: 'Erro interno ao processar desconexão', error: error.message },
            { status: 500 }
        );
    }
}