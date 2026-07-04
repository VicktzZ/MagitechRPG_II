import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import type { CampaignWidget } from '@models';

/**
 * GET /api/campaign/[id]/widget — retorna o widget da campanha.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const campaign = await findCampaignByCodeOrId(params.id);
        if (!campaign) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        return Response.json(campaign.widget ?? null);
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/campaign/[id]/widget — substitui/atualiza o widget (SOMENTE MESTRE).
 * Body: { widget: CampaignWidget | null }  (null remove o widget)
 */
export async function PUT(
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

        if (!campaign.admin?.includes(session.user.id)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode administrar o widget' }, { status: 403 });
        }

        if (campaign.status === 'finished') {
            return Response.json({ message: 'FORBIDDEN', error: 'Campanha finalizada' }, { status: 403 });
        }

        const body: { widget: CampaignWidget | null } = await req.json();

        const widget = body.widget
            ? { ...body.widget, updatedAt: new Date().toISOString() }
            : undefined;

        // JSON round-trip para remover campos undefined (Firestore não aceita)
        const plain = JSON.parse(JSON.stringify({ ...campaign, widget: widget ?? null }));
        if (plain.widget === null) delete plain.widget;

        await campaignRepository.update(plain);

        return Response.json({ message: 'OK', widget: widget ?? null });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

/**
 * PATCH /api/campaign/[id]/widget — ajustes rápidos por MEMBROS da campanha:
 * valores de recursos e quantidades do estoque compartilhado.
 * Body: { resourceId?: string; stockId?: string; delta: number }
 */
export async function PATCH(
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

        if (campaign.status === 'finished') {
            return Response.json({ message: 'FORBIDDEN', error: 'Campanha finalizada' }, { status: 403 });
        }

        if (!campaign.widget) {
            return Response.json({ message: 'NOT FOUND', error: 'Esta campanha não possui widget' }, { status: 404 });
        }

        const body: { resourceId?: string; stockId?: string; delta: number } = await req.json();
        const delta = Number(body.delta) || 0;
        if (delta === 0) return Response.json({ message: 'OK', widget: campaign.widget });

        const widget: CampaignWidget = { ...campaign.widget };

        if (body.resourceId) {
            widget.resources = (widget.resources ?? []).map(r => {
                if (r.id !== body.resourceId) return r;
                const next = r.value + delta;
                const clamped = Math.max(0, r.max !== undefined && r.max !== null ? Math.min(r.max, next) : next);
                return { ...r, value: clamped };
            });
        } else if (body.stockId) {
            widget.stock = (widget.stock ?? [])
                .map(s => s.id === body.stockId ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s);
        } else {
            return Response.json({ message: 'BAD REQUEST', error: 'resourceId ou stockId obrigatório' }, { status: 400 });
        }

        widget.updatedAt = new Date().toISOString();

        const plain = JSON.parse(JSON.stringify({ ...campaign, widget }));
        await campaignRepository.update(plain);

        return Response.json({ message: 'OK', widget });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}
