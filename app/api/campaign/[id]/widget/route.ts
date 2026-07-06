import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { campaignRepository, charsheetRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { MAX_CAMPAIGN_WIDGETS, type CampaignWidget } from '@models';

/**
 * GET /api/campaign/[id]/widget — retorna os widgets da campanha.
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
        return Response.json(campaign.widgets ?? []);
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/campaign/[id]/widget — substitui a lista inteira de widgets (SOMENTE MESTRE).
 * Body: { widgets: CampaignWidget[] }  (máx. MAX_CAMPAIGN_WIDGETS)
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

        const body: { widgets: CampaignWidget[] } = await req.json();

        if (!Array.isArray(body.widgets)) {
            return Response.json({ message: 'BAD REQUEST', error: 'widgets deve ser uma lista' }, { status: 400 });
        }

        if (body.widgets.length > MAX_CAMPAIGN_WIDGETS) {
            return Response.json({ message: 'BAD REQUEST', error: `Máximo de ${MAX_CAMPAIGN_WIDGETS} widgets por campanha` }, { status: 400 });
        }

        const widgets = body.widgets.map(w => ({ ...w, updatedAt: new Date().toISOString() }));

        // JSON round-trip para remover campos undefined (Firestore não aceita)
        const plain = JSON.parse(JSON.stringify({ ...campaign, widgets }));

        await campaignRepository.update(plain);

        return Response.json({ message: 'OK', widgets });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

interface PatchBody {
    widgetId: string;
    action: 'adjustResource' | 'adjustBar' | 'adjustStock' | 'deposit' | 'withdraw' | 'craft'
        | 'poolTransaction' | 'claimBounty' | 'approveBounty' | 'adjustClock';
    resourceId?: string;
    bar?: 'integrity' | 'secondary';
    stockId?: string;
    delta?: number;
    value?: number;
    charsheetId?: string;
    /** Índice do item em charsheet.inventory.items — itens antigos podem não ter id */
    itemIndex?: number;
    quantity?: number;
    recipeId?: string;
    poolId?: string;
    amount?: number;
    bountyId?: string;
    clockId?: string;
}

/**
 * PATCH /api/campaign/[id]/widget — ações de MEMBROS da campanha:
 * ajuste de recursos/barras/estoque, transferência de itens e crafting.
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

        const isGM = campaign.admin?.includes(session.user.id) ?? false;
        const isMember = isGM || campaign.players?.some(p => p.userId === session.user.id);
        if (!isMember) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você não participa desta campanha' }, { status: 403 });
        }

        if (campaign.status === 'finished') {
            return Response.json({ message: 'FORBIDDEN', error: 'Campanha finalizada' }, { status: 403 });
        }

        const widgets = campaign.widgets ?? [];
        const body: PatchBody = await req.json();
        const widgetIndex = widgets.findIndex(w => w.id === body.widgetId);
        if (widgetIndex === -1) {
            return Response.json({ message: 'NOT FOUND', error: 'Widget não encontrado' }, { status: 404 });
        }

        const widget: CampaignWidget = { ...widgets[widgetIndex] };

        const applyAdjust = (current: number, max?: number): number => {
            const next = body.value !== undefined ? Number(body.value) : current + (Number(body.delta) || 0);
            const clamped = Math.max(0, max !== undefined && max !== null ? Math.min(max, next) : next);
            return isNaN(clamped) ? current : clamped;
        };

        if (
            (body.action === 'adjustResource' || body.action === 'adjustStock') &&
            widget.playersCanManageResources === false &&
            !isGM
        ) {
            return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode administrar recursos e estoque deste widget' }, { status: 403 });
        }

        switch (body.action) {
        case 'adjustResource': {
            if (!body.resourceId) {
                return Response.json({ message: 'BAD REQUEST', error: 'resourceId obrigatório' }, { status: 400 });
            }
            widget.resources = (widget.resources ?? []).map(r =>
                r.id === body.resourceId ? { ...r, value: applyAdjust(r.value, r.max) } : r
            );
            break;
        }
        case 'adjustBar': {
            if (body.bar === 'integrity') {
                widget.integrity = applyAdjust(widget.integrity, widget.maxIntegrity);
            } else if (body.bar === 'secondary') {
                widget.secondary = applyAdjust(widget.secondary, widget.maxSecondary);
            } else {
                return Response.json({ message: 'BAD REQUEST', error: 'bar deve ser integrity ou secondary' }, { status: 400 });
            }
            break;
        }
        case 'adjustStock': {
            if (!body.stockId) {
                return Response.json({ message: 'BAD REQUEST', error: 'stockId obrigatório' }, { status: 400 });
            }
            widget.stock = (widget.stock ?? []).map(s =>
                s.id === body.stockId ? { ...s, quantity: applyAdjust(s.quantity) } : s
            );
            break;
        }
        case 'deposit': {
            if (!body.charsheetId || body.itemIndex == null) {
                return Response.json({ message: 'BAD REQUEST', error: 'charsheetId e itemIndex obrigatórios' }, { status: 400 });
            }
            const charsheet = await charsheetRepository.whereEqualTo('id', body.charsheetId).findOne();
            if (!charsheet) {
                return Response.json({ message: 'NOT FOUND', error: 'Personagem não encontrado' }, { status: 404 });
            }
            if (charsheet.userId !== session.user.id && !campaign.admin?.includes(session.user.id)) {
                return Response.json({ message: 'FORBIDDEN', error: 'Este personagem não é seu' }, { status: 403 });
            }

            const items = charsheet.inventory?.items ?? [];
            // Índice em vez de id — itens do catálogo padrão (ex: "Bolsa") podem não ter id
            const item = items[body.itemIndex];
            if (!item) {
                return Response.json({ message: 'NOT FOUND', error: 'Item não encontrado no inventário' }, { status: 404 });
            }

            const transferQty = Math.max(1, Math.min(body.quantity ?? item.quantity, item.quantity));
            const itemWeight = item.weight || 0;

            const currentStockWeight = (widget.stock ?? []).reduce((sum, s) => sum + (s.weight || 0) * s.quantity, 0);
            const newStockWeight = parseFloat((currentStockWeight + itemWeight * transferQty).toFixed(2));
            if (widget.stockMaxWeight && widget.stockMaxWeight > 0 && newStockWeight > widget.stockMaxWeight) {
                const unit = widget.stockWeightUnit ?? 'kg';
                const addedWeight = (itemWeight * transferQty).toFixed(1);
                const stockErrorMsg = `O estoque não possui capacidade suficiente. (${currentStockWeight.toFixed(1)}+${addedWeight}>${widget.stockMaxWeight}${unit})`;
                return Response.json({ message: 'BAD REQUEST', error: stockErrorMsg }, { status: 400 });
            }

            const existingStock = (widget.stock ?? []).find(s => s.name.toLowerCase() === item.name.toLowerCase());
            widget.stock = existingStock
                ? widget.stock.map(s => s === existingStock ? { ...s, quantity: s.quantity + transferQty } : s)
                : [ ...(widget.stock ?? []), {
                    id: crypto.randomUUID(),
                    name: item.name,
                    description: item.description,
                    weight: itemWeight,
                    quantity: transferQty
                } ];

            const remainingQty = item.quantity - transferQty;
            const newItems = remainingQty > 0
                ? items.map((i: any, idx: number) => idx === body.itemIndex ? { ...i, quantity: remainingQty } : i)
                : items.filter((_: any, idx: number) => idx !== body.itemIndex);

            const newCargo = Math.max(0, parseFloat(((charsheet.capacity?.cargo || 0) - itemWeight * transferQty).toFixed(2)));

            await charsheetRepository.update({
                ...charsheet,
                inventory: { ...charsheet.inventory, items: newItems },
                capacity: { ...charsheet.capacity, cargo: newCargo }
            });
            break;
        }
        case 'withdraw': {
            if (!body.charsheetId || !body.stockId) {
                return Response.json({ message: 'BAD REQUEST', error: 'charsheetId e stockId obrigatórios' }, { status: 400 });
            }
            const charsheet = await charsheetRepository.whereEqualTo('id', body.charsheetId).findOne();
            if (!charsheet) {
                return Response.json({ message: 'NOT FOUND', error: 'Personagem não encontrado' }, { status: 404 });
            }
            if (charsheet.userId !== session.user.id && !campaign.admin?.includes(session.user.id)) {
                return Response.json({ message: 'FORBIDDEN', error: 'Este personagem não é seu' }, { status: 403 });
            }

            const stockItem = (widget.stock ?? []).find(s => s.id === body.stockId);
            if (!stockItem) {
                return Response.json({ message: 'NOT FOUND', error: 'Item não encontrado no estoque' }, { status: 404 });
            }

            const transferQty = Math.max(1, Math.min(body.quantity ?? stockItem.quantity, stockItem.quantity));
            const itemWeight = stockItem.weight || 0;

            const currentCargo = charsheet.capacity?.cargo || 0;
            const maxCargo = charsheet.capacity?.max || 0;
            const newCargo = parseFloat((currentCargo + itemWeight * transferQty).toFixed(2));
            if (maxCargo > 0 && newCargo > maxCargo) {
                const cargoErrorMsg = `${charsheet.name || 'Você'} não possui capacidade de peso suficiente. (${currentCargo.toFixed(1)}+${(itemWeight * transferQty).toFixed(1)}>${maxCargo}kg)`;
                return Response.json({ message: 'BAD REQUEST', error: cargoErrorMsg }, { status: 400 });
            }

            const items = charsheet.inventory?.items ?? [];
            const existingItem = items.find((i: any) => i.name.toLowerCase() === stockItem.name.toLowerCase());
            const newItems = existingItem
                ? items.map((i: any) => i === existingItem ? { ...i, quantity: i.quantity + transferQty } : i)
                : [ ...items, {
                    id: crypto.randomUUID(),
                    name: stockItem.name,
                    description: stockItem.description ?? '',
                    rarity: 'Comum',
                    type: 'item',
                    kind: 'Padrão',
                    weight: itemWeight,
                    quantity: transferQty,
                    effects: []
                } ];

            const remainingQty = stockItem.quantity - transferQty;
            widget.stock = remainingQty > 0
                ? widget.stock.map(s => s.id === body.stockId ? { ...s, quantity: remainingQty } : s)
                : widget.stock.filter(s => s.id !== body.stockId);

            await charsheetRepository.update({
                ...charsheet,
                inventory: { ...charsheet.inventory, items: newItems },
                capacity: { ...charsheet.capacity, cargo: newCargo }
            });
            break;
        }
        case 'craft': {
            if (!body.recipeId) {
                return Response.json({ message: 'BAD REQUEST', error: 'recipeId obrigatório' }, { status: 400 });
            }
            const recipe = (widget.recipes ?? []).find(r => r.id === body.recipeId);
            if (!recipe) {
                return Response.json({ message: 'NOT FOUND', error: 'Receita não encontrada' }, { status: 404 });
            }

            const multiplier = Math.max(1, Math.floor(Number(body.quantity) || 1));
            const outputKind = recipe.output.kind ?? 'item';
            // Armas/armaduras têm estatísticas de combate — vão sempre para o inventário
            // pessoal de quem fabricou, nunca para o estoque compartilhado (só genérico).
            const routeToCharsheet = outputKind !== 'item' || widget.showStock === false;
            const outputToStock = !routeToCharsheet;

            for (const input of recipe.inputs) {
                const stockItem = (widget.stock ?? []).find(s => s.name.toLowerCase() === input.stockName.toLowerCase());
                if (!stockItem || stockItem.quantity < input.quantity * multiplier) {
                    return Response.json({ message: 'BAD REQUEST', error: `Estoque insuficiente de "${input.stockName}"` }, { status: 400 });
                }
            }
            for (const cost of recipe.resourceCosts ?? []) {
                const resource = (widget.resources ?? []).find(r => r.id === cost.resourceId);
                if (!resource || resource.value < cost.amount * multiplier) {
                    return Response.json({ message: 'BAD REQUEST', error: `Recurso insuficiente: "${resource?.name ?? cost.resourceId}"` }, { status: 400 });
                }
            }

            const outputQty = recipe.output.quantity * multiplier;

            let craftCharsheet: any = null;
            if (routeToCharsheet) {
                if (!body.charsheetId) {
                    const msg = outputKind !== 'item'
                        ? 'Selecione uma ficha para receber a arma/armadura fabricada'
                        : 'Este widget não possui estoque próprio — selecione uma ficha para receber o item';
                    return Response.json({ message: 'BAD REQUEST', error: msg }, { status: 400 });
                }
                craftCharsheet = await charsheetRepository.whereEqualTo('id', body.charsheetId).findOne();
                if (!craftCharsheet) {
                    return Response.json({ message: 'NOT FOUND', error: 'Personagem não encontrado' }, { status: 404 });
                }
                if (craftCharsheet.userId !== session.user.id && !campaign.admin?.includes(session.user.id)) {
                    return Response.json({ message: 'FORBIDDEN', error: 'Este personagem não é seu' }, { status: 403 });
                }

                if (outputKind === 'weapon' || outputKind === 'armor') {
                    const invKey = outputKind === 'weapon' ? 'weapons' : 'armors';
                    const maxCount = outputKind === 'weapon' ? 2 : 1;
                    const currentList = craftCharsheet.inventory?.[invKey] ?? [];
                    if (currentList.length + outputQty > maxCount) {
                        const label = outputKind === 'weapon' ? 'armas' : 'armadura(s)';
                        return Response.json({ message: 'BAD REQUEST', error: `${craftCharsheet.name || 'O personagem'} já possui (ou excederia) o limite de ${maxCount} ${label}.` }, { status: 400 });
                    }
                }

                const outputWeight = (recipe.output.weight || 0) * outputQty;
                const currentCargo = craftCharsheet.capacity?.cargo || 0;
                const maxCargo = craftCharsheet.capacity?.max || 0;
                const newCargo = parseFloat((currentCargo + outputWeight).toFixed(2));
                if (maxCargo > 0 && newCargo > maxCargo) {
                    return Response.json({ message: 'BAD REQUEST', error: `${craftCharsheet.name || 'Você'} não possui capacidade de peso suficiente para o item fabricado.` }, { status: 400 });
                }
            }

            let stock = [ ...(widget.stock ?? []) ];
            for (const input of recipe.inputs) {
                stock = stock
                    .map(s => s.name.toLowerCase() === input.stockName.toLowerCase() ? { ...s, quantity: s.quantity - input.quantity * multiplier } : s)
                    .filter(s => s.quantity > 0);
            }

            if (outputKind === 'weapon' || outputKind === 'armor') {
                const invKey = outputKind === 'weapon' ? 'weapons' : 'armors';
                const currentList = craftCharsheet.inventory?.[invKey] ?? [];
                const newEntries = Array.from({ length: outputQty }, () => ({
                    ...(recipe.output.itemData ?? {}),
                    id: crypto.randomUUID(),
                    name: recipe.output.name,
                    weight: recipe.output.weight ?? (recipe.output.itemData as any)?.weight ?? 0
                }));
                const outputWeight = (recipe.output.weight || 0) * outputQty;
                const newCargo = parseFloat(((craftCharsheet.capacity?.cargo || 0) + outputWeight).toFixed(2));
                await charsheetRepository.update({
                    ...craftCharsheet,
                    inventory: { ...craftCharsheet.inventory, [invKey]: [ ...currentList, ...newEntries ] },
                    capacity: { ...craftCharsheet.capacity, cargo: newCargo }
                });
            } else if (outputToStock) {
                const existingOutput = stock.find(s => s.name.toLowerCase() === recipe.output.name.toLowerCase());
                stock = existingOutput
                    ? stock.map(s => s === existingOutput ? { ...s, quantity: s.quantity + outputQty } : s)
                    : [ ...stock, {
                        id: crypto.randomUUID(),
                        name: recipe.output.name,
                        description: recipe.output.description,
                        weight: recipe.output.weight,
                        quantity: outputQty
                    } ];
            } else {
                const craftItems = craftCharsheet.inventory?.items ?? [];
                const existingItem = craftItems.find((i: any) => i.name.toLowerCase() === recipe.output.name.toLowerCase());
                const newItems = existingItem
                    ? craftItems.map((i: any) => i === existingItem ? { ...i, quantity: i.quantity + outputQty } : i)
                    : [ ...craftItems, {
                        id: crypto.randomUUID(),
                        name: recipe.output.name,
                        description: recipe.output.description ?? '',
                        rarity: 'Comum',
                        type: 'item',
                        kind: 'Padrão',
                        weight: recipe.output.weight || 0,
                        quantity: outputQty,
                        effects: []
                    } ];
                const outputWeight = (recipe.output.weight || 0) * outputQty;
                const newCargo = parseFloat(((craftCharsheet.capacity?.cargo || 0) + outputWeight).toFixed(2));
                await charsheetRepository.update({
                    ...craftCharsheet,
                    inventory: { ...craftCharsheet.inventory, items: newItems },
                    capacity: { ...craftCharsheet.capacity, cargo: newCargo }
                });
            }

            widget.stock = stock;
            widget.resources = (widget.resources ?? []).map(r => {
                const cost = (recipe.resourceCosts ?? []).find(c => c.resourceId === r.id);
                return cost ? { ...r, value: r.value - cost.amount * multiplier } : r;
            });
            widget.craftLog = [
                {
                    id: crypto.randomUUID(),
                    recipeName: recipe.name,
                    quantity: outputQty,
                    userName: session.user.name || 'Alguém',
                    timestamp: new Date().toISOString()
                },
                ...(widget.craftLog ?? [])
            ].slice(0, 30);
            break;
        }
        case 'poolTransaction': {
            if (!body.poolId || !body.amount) {
                return Response.json({ message: 'BAD REQUEST', error: 'poolId e amount obrigatórios' }, { status: 400 });
            }
            const pool = (widget.pools ?? []).find(p => p.id === body.poolId);
            if (!pool) {
                return Response.json({ message: 'NOT FOUND', error: 'Fundo não encontrado' }, { status: 404 });
            }
            const amount = Number(body.amount);
            const newValue = parseFloat((pool.value + amount).toFixed(2));
            if (newValue < 0) {
                return Response.json({ message: 'BAD REQUEST', error: 'Saldo insuficiente no fundo' }, { status: 400 });
            }
            if (pool.max && pool.max > 0 && newValue > pool.max) {
                return Response.json({ message: 'BAD REQUEST', error: 'Isso excede a capacidade do fundo' }, { status: 400 });
            }
            const entry = {
                id: crypto.randomUUID(),
                userName: session.user.name || 'Alguém',
                amount,
                timestamp: new Date().toISOString()
            };
            widget.pools = (widget.pools ?? []).map(p => p.id === body.poolId
                ? { ...p, value: newValue, history: [ entry, ...(p.history ?? []) ].slice(0, 30) }
                : p);
            break;
        }
        case 'claimBounty': {
            if (!body.bountyId || !body.charsheetId) {
                return Response.json({ message: 'BAD REQUEST', error: 'bountyId e charsheetId obrigatórios' }, { status: 400 });
            }
            const bounty = (widget.bounties ?? []).find(b => b.id === body.bountyId);
            if (!bounty) {
                return Response.json({ message: 'NOT FOUND', error: 'Tarefa não encontrada' }, { status: 404 });
            }
            const claimCharsheet = await charsheetRepository.whereEqualTo('id', body.charsheetId).findOne();
            if (!claimCharsheet) {
                return Response.json({ message: 'NOT FOUND', error: 'Personagem não encontrado' }, { status: 404 });
            }
            if (claimCharsheet.userId !== session.user.id && !campaign.admin?.includes(session.user.id)) {
                return Response.json({ message: 'FORBIDDEN', error: 'Este personagem não é seu' }, { status: 403 });
            }
            widget.bounties = (widget.bounties ?? []).map(b => b.id === body.bountyId
                ? { ...b, status: 'pending', claimedByCharsheetId: claimCharsheet.id, claimedByName: claimCharsheet.name }
                : b);
            break;
        }
        case 'approveBounty': {
            if (!campaign.admin?.includes(session.user.id)) {
                return Response.json({ message: 'FORBIDDEN', error: 'Apenas o mestre pode aprovar tarefas' }, { status: 403 });
            }
            if (!body.bountyId) {
                return Response.json({ message: 'BAD REQUEST', error: 'bountyId obrigatório' }, { status: 400 });
            }
            const bounty = (widget.bounties ?? []).find(b => b.id === body.bountyId);
            if (!bounty) {
                return Response.json({ message: 'NOT FOUND', error: 'Tarefa não encontrada' }, { status: 404 });
            }
            widget.bounties = (widget.bounties ?? []).map(b => b.id === body.bountyId ? { ...b, status: 'done' } : b);
            if (bounty.rewardResourceId && bounty.rewardAmount) {
                widget.resources = (widget.resources ?? []).map(r => {
                    if (r.id !== bounty.rewardResourceId) return r;
                    const next = r.value + (bounty.rewardAmount || 0);
                    return { ...r, value: r.max !== undefined && r.max !== null ? Math.min(r.max, next) : next };
                });
            }
            break;
        }
        case 'adjustClock': {
            if (!body.clockId) {
                return Response.json({ message: 'BAD REQUEST', error: 'clockId obrigatório' }, { status: 400 });
            }
            const clock = (widget.clocks ?? []).find(c => c.id === body.clockId);
            if (!clock) {
                return Response.json({ message: 'NOT FOUND', error: 'Relógio não encontrado' }, { status: 404 });
            }
            const nextClockValue = body.value !== undefined ? Number(body.value) : clock.current + (Number(body.delta) || 0);
            const clampedClock = Math.max(0, Math.min(clock.max, isNaN(nextClockValue) ? clock.current : nextClockValue));
            widget.clocks = (widget.clocks ?? []).map(c => c.id === body.clockId ? { ...c, current: clampedClock } : c);
            break;
        }
        default:
            return Response.json({ message: 'BAD REQUEST', error: 'Ação inválida' }, { status: 400 });
        }

        widget.updatedAt = new Date().toISOString();
        const newWidgets = widgets.map((w, i) => i === widgetIndex ? widget : w);

        const plain = JSON.parse(JSON.stringify({ ...campaign, widgets: newWidgets }));
        await campaignRepository.update(plain);

        return Response.json({ message: 'OK', widget });
    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}
