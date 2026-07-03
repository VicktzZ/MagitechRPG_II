import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';

/**
 * POST /api/campaign/[id]/finish
 * Finaliza a campanha (somente mestre): sessões bloqueadas,
 * estatísticas congeladas. Reversível via DELETE.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const campaign = await findCampaignByCodeOrId(params.id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        if (!campaign.admin?.includes(session.user.id)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode finalizar a campanha' }, { status: 403 });
        }

        if (campaign.status === 'finished') {
            return Response.json({ message: 'ALREADY_FINISHED', error: 'A campanha já está finalizada' }, { status: 400 });
        }

        campaign.status = 'finished';
        campaign.finishedAt = new Date().toISOString();
        await campaignRepository.update(campaign);

        return Response.json({ message: 'OK', finishedAt: campaign.finishedAt });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/campaign/[id]/finish
 * Reabre uma campanha finalizada (somente mestre).
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const campaign = await findCampaignByCodeOrId(params.id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        if (!campaign.admin?.includes(session.user.id)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode reabrir a campanha' }, { status: 403 });
        }

        if (campaign.status !== 'finished') {
            return Response.json({ message: 'NOT_FINISHED', error: 'A campanha não está finalizada' }, { status: 400 });
        }

        campaign.status = 'active';
        await campaignRepository.update(campaign);

        return Response.json({ message: 'OK' });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}
