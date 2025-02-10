import { PusherEvent } from '@enums';
import Campaign from '@models/campaign';
import { pusherServer } from '@utils/pusher';
import { connectToDb } from '@utils/database';
import type { NextRequest } from 'next/server';

interface id { id: string }

export async function POST(
    req: Request,
    { params }: { params: id }
): Promise<Response> {
    try {
        await connectToDb();
        let code;

        const { id } = params;
        if (id.length === 8) code = id;

        const message = await req.json();
        const campaign = await Campaign.findOne(
            code ? { campaignCode: code } : { _id: id }
        );

        if (!campaign) {
            return Response.json({ error: 'Campanha não encontrada' }, { status: 404 });
        }

        // Adiciona a mensagem e limpa mensagens antigas se necessário
        campaign.session.messages.push(message);
        campaign.clearMessagesIfLimitReached(999);
        await campaign.save();

        // Envia apenas a nova mensagem via Pusher
        await pusherServer.trigger('presence-' + (code ?? id), PusherEvent.NEW_MESSAGE, message);

        return Response.json(message, { status: 200 });
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
        await connectToDb();
        let code;

        const { id } = params;
        if (id.length === 8) code = id;

        const campaign = await Campaign.findOne(
            code ? { campaignCode: code } : { _id: id }
        );

        if (!campaign) {
            return Response.json({ error: 'Campanha não encontrada' }, { status: 404 });
        }

        return Response.json(campaign.session.messages || [], { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
