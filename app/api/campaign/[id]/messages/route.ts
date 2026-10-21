/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { PusherEvent } from '@enums';
import { Message } from '@models';
import { pusherServer } from '@utils/pusher';
import { appendCampaignMessage, listCampaignMessages } from '@utils/firestore/campaignMessages';
import { randomUUID } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { NextRequest } from 'next/server';
import { assertMaxLength, handleRouteError, isValidId, readJsonBody, requireCampaignMember, requireUser, TEXT_LIMITS } from '@utils/api';

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

        if (campaign.status === 'finished') {
            return Response.json({ error: 'Campanha finalizada — o chat está bloqueado' }, { status: 403 });
        }

        // O ID da mensagem é o ID do documento: um ID do cliente só vale se for um ID de documento
        // válido (UUIDs são); o horário é o do servidor, para a ordem do chat não depender dos relógios.
        // Só os campos de uma mensagem: o cliente também manda tempId/isPending, que não devem ser salvos.
        const messageWithId = { ...new Message({
            id: isValidId(dto.id) ? dto.id : randomUUID(),
            text: dto.text,
            type: dto.type,
            isHTML: dto.isHTML,
            by: dto.by,
            timestamp: new Date().toISOString()
        }) };

        // Só cria um documento novo: não relê nem regrava a campanha, então não desfaz alterações simultâneas
        await appendCampaignMessage(campaign.id, messageWithId);

        // O Pusher é um aviso extra: se falhar, a mensagem já está salva
        try {
            await pusherServer.trigger(
                `presence-${campaign.campaignCode}`,
                PusherEvent.NEW_MESSAGE,
                messageWithId
            );
        } catch (error) {
            console.error('[Chat] Falha ao avisar o Pusher da nova mensagem:', error);
        }

        return Response.json(messageWithId, { status: 200 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao salvar mensagem');
    }
}

/**
 * Mensagens do chat, das mais recentes para trás: `?beforeId=<id>` traz as anteriores a essa
 * mensagem e `?limit=` define o tamanho da página (padrão 100, máximo 200).
 */
export async function GET(
    req: NextRequest,
    { params }: { params: id }
): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignMember(params.id, user);

        const { searchParams } = req.nextUrl;
        const beforeId = searchParams.get('beforeId') ?? undefined;
        if (beforeId !== undefined && !isValidId(beforeId)) {
            return Response.json({ error: '"beforeId" inválido' }, { status: 400 });
        }

        const page = await listCampaignMessages(campaign.id, { beforeId, limit: searchParams.get('limit') });

        return Response.json(page, { status: 200 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar mensagens');
    }
}
