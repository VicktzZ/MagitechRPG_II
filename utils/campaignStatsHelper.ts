import { campaignStatsRepository } from '@repositories';
import { CampaignStats, emptyPlayerStats, emptyGMStats } from '@models/entities';
import type { PlayerCampaignStats, GMCampaignStats } from '@models/entities';

/**
 * Uma entrada de estatística a registrar.
 * - Com `charsheetId`: aplica no jogador (cria a entrada se não existir).
 * - Com `gm: true`: aplica nas estatísticas do mestre.
 *
 * `inc` incrementa contadores por caminho ('combat.damageDealt': 10).
 * `max` mantém o maior valor ('dice.highestRoll': 25, 'progression.highestLevel': 5).
 * `expertiseUsed` incrementa o contador de uso da perícia.
 */
export interface StatsEntry {
    charsheetId?: string;
    userId?: string;
    charsheetName?: string;
    gm?: boolean;
    inc?: Record<string, number>;
    max?: Record<string, number>;
    expertiseUsed?: string;
}

function applyNumericPatch(target: Record<string, any>, path: string, value: number, mode: 'inc' | 'max') {
    const parts = path.split('.');
    let obj = target;
    for (let i = 0; i < parts.length - 1; i++) {
        if (typeof obj[parts[i]] !== 'object' || obj[parts[i]] === null) {
            obj[parts[i]] = {};
        }
        obj = obj[parts[i]];
    }
    const key = parts[parts.length - 1];
    const current = typeof obj[key] === 'number' ? obj[key] : 0;
    obj[key] = mode === 'inc' ? current + value : Math.max(current, value);
}

/**
 * Registra estatísticas de campanha (fire-and-forget seguro).
 * Nunca lança erro — estatísticas jamais devem quebrar o fluxo de jogo.
 * Cria o documento de stats na primeira gravação da campanha.
 *
 * IMPORTANTE: o chamador deve garantir que a campanha não está finalizada
 * (campaign.status !== 'finished') antes de registrar.
 */
export async function recordCampaignStats(campaignId: string, entries: StatsEntry[]): Promise<void> {
    if (!campaignId || entries.length === 0) return;

    try {
        let stats = await campaignStatsRepository
            .whereEqualTo('campaignId', campaignId)
            .findOne();

        const isNew = !stats;
        if (!stats) {
            stats = new CampaignStats({ campaignId, players: {}, gm: emptyGMStats() });
        }

        for (const entry of entries) {
            let target: PlayerCampaignStats | GMCampaignStats;

            if (entry.gm) {
                stats.gm = stats.gm ?? emptyGMStats();
                target = stats.gm;
            } else if (entry.charsheetId) {
                if (!stats.players[entry.charsheetId]) {
                    stats.players[entry.charsheetId] = emptyPlayerStats(
                        entry.userId ?? '',
                        entry.charsheetId,
                        entry.charsheetName ?? ''
                    );
                }
                const player = stats.players[entry.charsheetId];
                // Atualiza metadados se vierem mais completos
                if (entry.charsheetName) player.charsheetName = entry.charsheetName;
                if (entry.userId) player.userId = entry.userId;
                target = player;
            } else {
                continue;
            }

            for (const [ path, value ] of Object.entries(entry.inc ?? {})) {
                if (typeof value === 'number' && isFinite(value) && value !== 0) {
                    applyNumericPatch(target as Record<string, any>, path, value, 'inc');
                }
            }
            for (const [ path, value ] of Object.entries(entry.max ?? {})) {
                if (typeof value === 'number' && isFinite(value)) {
                    applyNumericPatch(target as Record<string, any>, path, value, 'max');
                }
            }
            if (entry.expertiseUsed && !entry.gm) {
                const player = target as PlayerCampaignStats;
                player.dice.expertiseUsage = player.dice.expertiseUsage ?? {};
                player.dice.expertiseUsage[entry.expertiseUsed] =
                    (player.dice.expertiseUsage[entry.expertiseUsed] ?? 0) + 1;
            }
        }

        stats.updatedAt = new Date().toISOString();

        if (isNew) {
            await campaignStatsRepository.create(stats);
        } else {
            await campaignStatsRepository.update(stats);
        }
    } catch (error) {
        // Estatísticas nunca devem quebrar a ação principal
        console.error('[campaignStats] Erro ao registrar estatísticas:', error);
    }
}
