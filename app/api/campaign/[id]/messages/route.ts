/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { PusherEvent } from '@enums';
import { pusherServer } from '@utils/pusher';
import { getCampaign } from '@utils/server/getCampaign';
import { arrayUnion, updateDoc } from 'firebase/firestore';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
interface id { id: string }

export async function POST(
    req: Request,
    { params }: { params: id }
): Promise<Response> {
    try {
        const { id } = params;
        const message = await req.json();
        const messageId = message.id || uuidv4();
        const messageWithId = { ...message, id: messageId };

        // Adicionar mensagem usando arrayUnion
        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ error: 'Campanha não encontrada' }, { status: 404 });
        }
        await updateDoc(campaignSnap.ref, {
            'session.messages': arrayUnion(messageWithId)
        });

        // Envia apenas a nova mensagem via Pusher
        await pusherServer.trigger('presence-' + id, PusherEvent.NEW_MESSAGE, messageWithId);

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
        const snap = await getCampaign(id);
        if (!snap.exists()) {
            return Response.json({ error: 'Campanha não encontrada' }, { status: 404 });
        }
        const campaign = snap.data();
        return Response.json(campaign?.session?.messages || [], { status: 200 });
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
