/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { PusherEvent } from '@enums';
import { Message } from '@models';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { pusherServer } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { NextRequest } from 'next/server';

interface id { id: string }

export async function POST(
    req: Request,
    { params }: { params: id }
): Promise<Response> {
    try {
        const { id } = params;
        const body: Message = await req.json();

        const dto = plainToInstance(Message, body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        let messageWithId = new Message(dto);
        messageWithId = { ...messageWithId }
        const campaign = await findCampaignByCodeOrId(id);
        
        if (!campaign) {
            return Response.json({ error: 'Campanha não encontrada' }, { status: 404 });
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
        console.error('Erro ao salvar mensagem:', error);
        return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: id }
): Promise<Response> {
    try {
        const { id } = params;

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ error: 'Campanha não encontrada' }, { status: 404 });
        }

        return Response.json(campaign?.session?.messages || [], { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}