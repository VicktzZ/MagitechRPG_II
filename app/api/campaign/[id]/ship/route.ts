import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import type { CampaignShip } from '@models';

/**
 * GET /api/campaign/[id]/ship — retorna a nave da campanha (membros).
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
        return Response.json(campaign.ship ?? null);
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/campaign/[id]/ship — substitui/atualiza a nave (SOMENTE MESTRE).
 * Body: { ship: CampaignShip | null }  (null remove a nave)
 */
export async function PUT(
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
            return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode administrar a nave' }, { status: 403 });
        }

        if (campaign.status === 'finished') {
            return Response.json({ message: 'FORBIDDEN', error: 'Campanha finalizada' }, { status: 403 });
        }

        const body: { ship: CampaignShip | null } = await req.json();

        const ship = body.ship
            ? { ...body.ship, updatedAt: new Date().toISOString() }
            : undefined;

        // JSON round-trip para remover campos undefined (Firestore não aceita)
        const plain = JSON.parse(JSON.stringify({ ...campaign, ship: ship ?? null }));
        if (plain.ship === null) delete plain.ship;

        await campaignRepository.update(plain);

        return Response.json({ message: 'OK', ship: ship ?? null });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

/**
 * PATCH /api/campaign/[id]/ship — ajustes rápidos por MEMBROS da campanha:
 * valores de recursos (combustível etc) e quantidades do estoque compartilhado.
 * Body: { resourceId?: string; cargoId?: string; delta: number }
 */
export async function PATCH(
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

        const isMember =
            campaign.admin?.includes(session.user.id) ||
            campaign.players?.some(p => p.userId === session.user.id);
        if (!isMember) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você não participa desta campanha' }, { status: 403 });
        }

        if (campaign.status === 'finished') {
            return Response.json({ message: 'FORBIDDEN', error: 'Campanha finalizada' }, { status: 403 });
        }

        if (!campaign.ship) {
            return Response.json({ message: 'NOT FOUND', error: 'Esta campanha não possui nave' }, { status: 404 });
        }

        const body: { resourceId?: string; cargoId?: string; delta: number } = await req.json();
        const delta = Number(body.delta) || 0;
        if (delta === 0) return Response.json({ message: 'OK', ship: campaign.ship });

        const ship: CampaignShip = { ...campaign.ship };

        if (body.resourceId) {
            ship.resources = (ship.resources ?? []).map(r => {
                if (r.id !== body.resourceId) return r;
                const next = r.value + delta;
                const clamped = Math.max(0, r.max !== undefined && r.max !== null ? Math.min(r.max, next) : next);
                return { ...r, value: clamped };
            });
        } else if (body.cargoId) {
            ship.cargo = (ship.cargo ?? [])
                .map(c => c.id === body.cargoId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c);
        } else {
            return Response.json({ message: 'BAD REQUEST', error: 'resourceId ou cargoId obrigatório' }, { status: 400 });
        }

        ship.updatedAt = new Date().toISOString();

        const plain = JSON.parse(JSON.stringify({ ...campaign, ship }));
        await campaignRepository.update(plain);

        return Response.json({ message: 'OK', ship });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}
