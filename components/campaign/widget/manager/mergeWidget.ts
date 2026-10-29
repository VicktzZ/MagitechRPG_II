import type { CampaignWidget } from '@models';

/**
 * Mescla uma lista de itens (por id) de três fontes — o snapshot original
 * (quando o dialog foi aberto), a edição local do mestre e o estado mais
 * recente do servidor — para que ações de jogadores (depósitos, crafting,
 * fundos etc.) feitas enquanto o dialog estava aberto não sejam perdidas.
 *
 * - Existe em local E fresh: mantém os campos de config do mestre, mas usa
 *   os `runtimeFields` do servidor (ex: quantidade, valor).
 * - Só em local: item novo criado pelo mestre nesta sessão — mantém.
 * - Só em fresh e não estava no baseline: item novo criado por um jogador
 *   enquanto o dialog estava aberto — mantém (é o bug original).
 * - Só em fresh e já estava no baseline: o mestre removeu deliberadamente
 *   no dialog — respeita a remoção.
 */
export function threeWayMergeById<T extends { id: string }>(
    baseline: T[],
    local: T[],
    fresh: T[],
    runtimeFields: Array<keyof T>
): T[] {
    const baselineIds = new Set(baseline.map(i => i.id));
    const freshById = new Map(fresh.map(i => [ i.id, i ]));
    const localById = new Map(local.map(i => [ i.id, i ]));
    const allIds = new Set([ ...freshById.keys(), ...localById.keys() ]);

    const result: T[] = [];
    allIds.forEach(id => {
        const freshItem = freshById.get(id);
        const localItem = localById.get(id);

        if (localItem && freshItem) {
            const merged = { ...localItem };
            runtimeFields.forEach(field => { merged[field] = freshItem[field]; });
            result.push(merged);
        } else if (localItem && !freshItem) {
            result.push(localItem);
        } else if (!localItem && freshItem && !baselineIds.has(id)) {
            result.push(freshItem);
        }
        // !localItem && freshItem && baselineIds.has(id) → removido deliberadamente pelo mestre
    });
    return result;
}

/** Aplica o merge de 3 vias em todas as seções do widget que jogadores podem alterar. */
export function mergeWidgetForSave(
    baseline: CampaignWidget | undefined,
    local: CampaignWidget,
    fresh: CampaignWidget | undefined
): CampaignWidget {
    if (!fresh) return local; // widget novo, criado pelo mestre nesta sessão — nada a mesclar

    return {
        ...local,
        integrity: fresh.integrity,
        secondary: fresh.secondary,
        // craftLog é somente-leitura no dialog do mestre (só o servidor grava ao craftar) — usa sempre o mais recente.
        craftLog: fresh.craftLog ?? local.craftLog,
        resources: threeWayMergeById(baseline?.resources ?? [], local.resources, fresh.resources, [ 'value' ]),
        stock: threeWayMergeById(baseline?.stock ?? [], local.stock, fresh.stock, [ 'quantity' ]),
        pools: threeWayMergeById(baseline?.pools ?? [], local.pools, fresh.pools, [ 'value', 'history' ]),
        bounties: threeWayMergeById(
            baseline?.bounties ?? [], local.bounties, fresh.bounties,
            [ 'status', 'claimedByCharsheetId', 'claimedByName' ]
        ),
        clocks: threeWayMergeById(baseline?.clocks ?? [], local.clocks, fresh.clocks, [ 'current' ])
    };
}
