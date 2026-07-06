import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { campaignRepository, charsheetRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';

/**
 * POST/DELETE /api/campaign/[id]/dev-test-player — SOMENTE AMBIENTE DE DESENVOLVIMENTO.
 * Permite ao mestre anexar/remover uma ficha própria como jogador de teste da
 * própria campanha, para alternar entre a visão de Mestre e de Jogador sem
 * precisar de uma segunda conta.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
        return Response.json({ message: 'FORBIDDEN', error: 'Disponível apenas em ambiente de desenvolvimento' }, { status: 403 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const campaign = await findCampaignByCodeOrId(params.id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        if (!campaign.admin?.includes(session.user.id)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode anexar fichas de teste' }, { status: 403 });
        }

        const body: { charsheetId?: string } = await req.json();
        if (!body.charsheetId) {
            return Response.json({ message: 'BAD REQUEST', error: 'charsheetId obrigatório' }, { status: 400 });
        }

        const charsheet = await charsheetRepository.whereEqualTo('id', body.charsheetId).findOne();
        if (!charsheet) {
            return Response.json({ message: 'NOT FOUND', error: 'Ficha não encontrada' }, { status: 404 });
        }
        if (charsheet.userId !== session.user.id) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você só pode anexar fichas da sua própria conta' }, { status: 403 });
        }

        const alreadyAttached = campaign.players?.some(p => p.charsheetId === charsheet.id);
        if (!alreadyAttached) {
            const players = [ ...(campaign.players ?? []), { userId: session.user.id, charsheetId: charsheet.id } ];
            await campaignRepository.update({ ...campaign, players });
        }

        return Response.json({ message: 'OK', charsheetId: charsheet.id });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
        return Response.json({ message: 'FORBIDDEN', error: 'Disponível apenas em ambiente de desenvolvimento' }, { status: 403 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const campaign = await findCampaignByCodeOrId(params.id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        if (!campaign.admin?.includes(session.user.id)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode remover fichas de teste' }, { status: 403 });
        }

        const body: { charsheetId?: string } = await req.json();
        if (!body.charsheetId) {
            return Response.json({ message: 'BAD REQUEST', error: 'charsheetId obrigatório' }, { status: 400 });
        }

        const players = (campaign.players ?? []).filter(p => !(p.charsheetId === body.charsheetId && p.userId === session.user.id));
        await campaignRepository.update({ ...campaign, players });

        return Response.json({ message: 'OK' });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}
