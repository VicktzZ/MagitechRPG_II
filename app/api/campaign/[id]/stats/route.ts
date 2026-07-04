import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { campaignStatsRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { recordCampaignStats, type StatsEntry } from '@utils/campaignStatsHelper';
import { CampaignStats, emptyGMStats } from '@models/entities';

/**
 * GET /api/campaign/[id]/stats
 * Retorna as estatísticas da campanha (membros e mestre podem ver).
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const campaign = await findCampaignByCodeOrId(params.id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        const isMember =
            campaign.admin?.includes(session.user.id) ||
            campaign.players?.some(p => p.userId === session.user.id);
        if (!isMember) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você não participa desta campanha' }, { status: 403 });
        }

        const stats = await campaignStatsRepository
            .whereEqualTo('campaignId', campaign.id)
            .findOne();

        // Sem stats ainda: retorna estrutura vazia (campanha sem ações registradas)
        if (!stats) {
            return Response.json(new CampaignStats({ campaignId: campaign.id, players: {}, gm: emptyGMStats() }));
        }

        return Response.json(stats);
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/campaign/[id]/stats
 * Registra eventos de estatística vindos do cliente (testes de dados,
 * conjuração de magias, etc). Membros da campanha apenas.
 * Body: { entries: StatsEntry[] }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const campaign = await findCampaignByCodeOrId(params.id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        const isGM = campaign.admin?.includes(session.user.id);
        const isPlayer = campaign.players?.some(p => p.userId === session.user.id);
        if (!isGM && !isPlayer) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você não participa desta campanha' }, { status: 403 });
        }

        // Campanha finalizada não coleta mais estatísticas
        if (campaign.status === 'finished') {
            return Response.json({ message: 'CAMPAIGN_FINISHED' }, { status: 200 });
        }

        const body: { entries?: StatsEntry[] } = await req.json();
        const entries = (body.entries ?? []).filter(e => {
            // Jogador só registra nas próprias estatísticas; mestre pode tudo
            if (e.gm) return isGM;
            return isGM || campaign.players?.some(
                p => p.charsheetId === e.charsheetId && p.userId === session.user.id
            );
        });

        await recordCampaignStats(campaign.id, entries);

        return Response.json({ message: 'OK' });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}
