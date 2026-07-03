import type { StatsEntry } from './campaignStatsHelper';

/**
 * Envia eventos de estatística de campanha a partir do cliente.
 * Fire-and-forget: falhas são silenciosas — estatísticas nunca
 * devem atrapalhar o fluxo de jogo.
 */
export function postCampaignStats(campaignIdOrCode: string, entries: StatsEntry[]): void {
    if (!campaignIdOrCode || entries.length === 0) return;

    fetch(`/api/campaign/${campaignIdOrCode}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
    }).catch(() => {
        // silencioso
    });
}

export type { StatsEntry };
