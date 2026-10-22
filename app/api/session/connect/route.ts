import { PusherEvent } from '@enums';
import { JoinCampaignDTO } from '@models/dtos';
import type { SessionInfo } from '@models/types/misc';
import type { Campaign } from '@models/entities';
import { charsheetRepository } from '@repositories';
import { triggerPusher } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { adminUpdateDoc, adminUpdateDocInTransaction } from '@utils/firestore/adminDocs';
import { connectFields } from '@utils/campaignPresence';
import { assertId, findCampaignOrThrow, forbidden, getCampaignRole, handleRouteError, readJsonBody, requireUser } from '@utils/api';

export async function POST(req: Request): Promise<Response> {
    try {
        const user = await requireUser();
        const body: JoinCampaignDTO = await readJsonBody(req);

        // Quem conecta é sempre o usuário logado, e ser mestre é decidido pela
        // campanha — userId/isGM do body são ignorados
        const userId = user.id;
        const dto = plainToInstance(JoinCampaignDTO, { ...body, userId });
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const { campaignCode, charsheetId } = body;

        let campaign = await findCampaignOrThrow(String(campaignCode));
        const { isGM } = getCampaignRole(campaign, user);

        let charsheetPlayer: { charsheetId: string } | undefined;

        if (!isGM) {
            assertId(charsheetId, 'charsheetId');
            const userCharsheet = await charsheetRepository.whereEqualTo('id', charsheetId).findOne();
            if (!userCharsheet) {
                return Response.json({ message: 'Charsheet não encontrada' }, { status: 400 });
            }
            if (userCharsheet.userId !== userId) {
                throw forbidden('Você só pode entrar com uma ficha sua');
            }

            charsheetPlayer = { charsheetId };

            // Preserva os perks existentes da sessão atual
            const sessions = (userCharsheet.session ?? []) as SessionInfo[];
            const existingSession = sessions.find(s => s.campaignCode === campaign.campaignCode);

            const sessionInfo: SessionInfo = {
                campaignCode: campaign.campaignCode,
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

            const userSession = [ ...sessions.filter(s => s.campaignCode !== campaign.campaignCode), sessionInfo ];

            // Só o campo `session` da ficha: regravar a ficha inteira desfazia edições feitas ao mesmo tempo
            await adminUpdateDoc('charsheets', userCharsheet.id, { session: userSession });

            await triggerPusher(
                `presence-${campaign.campaignCode}`,
                PusherEvent.USER_ENTER,
                {
                    userId,
                    name: userCharsheet.name,
                    id: charsheetId
                }
            );
        }

        // Só `session.users` e `players` mudam, dentro de uma transação: entrar não reescreve a campanha
        // inteira e dois jogadores entrando juntos não se sobrescrevem
        await adminUpdateDocInTransaction<null, Campaign>('campaigns', campaign.id, data => ({
            fields: connectFields(data, userId, charsheetPlayer),
            result: null
        }));

        campaign = await findCampaignOrThrow(campaign.campaignCode);

        return Response.json({ campaign });
    } catch (error) {
        return handleRouteError(error, 'Erro ao conectar à sessão');
    }
}
