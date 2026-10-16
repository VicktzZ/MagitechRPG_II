/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { PusherEvent } from '@enums';
import { Message } from '@models';
import { campaignRepository } from '@repositories';
import { pusherServer } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { NextRequest } from 'next/server';
import { assertMaxLength, handleRouteError, readJsonBody, requireCampaignMember, requireUser, TEXT_LIMITS } from '@utils/api';

interface id { id: string }

/** Identidade fixa do bot de dados — o cliente não escolhe nome/imagem de "bot" */
const DICE_BOT = {
    id: 'dice-roller-bot',
    name: 'Dice Roller',
    image: '/assets/dice-roller-bot.jpg',
    isBot: true
};

export async function POST(
    req: Request,
    { params }: { params: id }
): Promise<Response> {
    try {
        const { id } = params;
        const user = await requireUser();
        const { campaign } = await requireCampaignMember(id, user);

        const body: Message = await readJsonBody(req, { maxBytes: 64 * 1024 });
        assertMaxLength(body.text, TEXT_LIMITS.chatMessage, 'text');
        assertMaxLength(body.type, TEXT_LIMITS.name, 'type');

        // O autor é sempre quem está logado. O selo de mestre no chat é derivado
        // de campaign.admin pelo id, então trocar o id seria se passar por outra pessoa.
        const by = body.by?.isBot
            ? DICE_BOT
            : { id: user.id, name: user.name, image: user.image ?? '' };

        const dto = plainToInstance(Message, { ...body, by });
        const errors = await validate(dto);
        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        let messageWithId = new Message(dto);
        messageWithId = { ...messageWithId }

        if (campaign.status === 'finished') {
            return Response.json({ error: 'Campanha finalizada — o chat está bloqueado' }, { status: 403 });
        }

        await campaignRepository.update({
            ...campaign,
            session: {
                ...campaign.session,
                messages: [ ...campaign.session.messages || [], messageWithId ]
            }
        });

        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NEW_MESSAGE,
            messageWithId
        );

        return Response.json(messageWithId, { status: 200 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao salvar mensagem');
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: id }
): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignMember(params.id, user);

        return Response.json(campaign?.session?.messages || [], { status: 200 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar mensagens');
    }
}
