import { notFound } from '@utils/api/errors';
import { applyVitalDelta, VITAL_FIELDS, VITAL_KEYS, type VitalDeltas, type VitalKey } from '@utils/vitals';
import { adminUpdateDocInTransaction } from './adminDocs';

export type VitalChange = Partial<Record<VitalKey, { before: number; after: number }>>;

/**
 * Soma as variações aos pontos vitais da ficha numa transação: o valor é lido e gravado sem que outra escrita
 * (o jogador gastando MP, outro clique do mestre) passe no meio, então nenhuma variação se perde. Grava só os
 * campos que mudaram, e não mexe em mais nada da ficha (o gasto de MP por turno do combate, por exemplo, fica
 * como está: o mestre ajustando MP à mão não conta como conjuração).
 *
 * `ceilings` troca o máximo da ficha pelo teto de agora de LP e MP, quando há efeito de combate mexendo nele (Fragilidade baixa, Sobrecura e Sobremana deixam passar;
 * `combatantCeilings`). Sem o teto de um ponto vital vale o máximo gravado.
 */
export async function adjustCharsheetStats(charsheetId: string, deltas: VitalDeltas, ceilings: Partial<Record<VitalKey, number>> = {}): Promise<VitalChange> {
    return await adminUpdateDocInTransaction<VitalChange, { stats?: Record<string, unknown> }>('charsheets', charsheetId, data => {
        if (!data) throw notFound('Ficha não encontrada');

        const fields: Record<string, unknown> = {};
        const result: VitalChange = {};

        for (const key of VITAL_KEYS) {
            const delta = deltas[key];
            if (delta === undefined) continue;

            const { current, max } = VITAL_FIELDS[key];
            const before = Number(data.stats?.[current] ?? 0);
            const after = applyVitalDelta(before, ceilings[key] ?? data.stats?.[max], delta);

            result[key] = { before: Number.isFinite(before) ? before : 0, after };
            if (after !== before) fields[`stats.${current}`] = after;
        }

        return { fields, result };
    });
}
