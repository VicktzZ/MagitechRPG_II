import { abilityStorageKey, readAbilityDayUses } from '@utils/combat/passives/abilities';
import { adminUpdateDoc, adminUpdateDocInTransaction } from './adminDocs';

/**
 * Usos **por dia** das habilidades ativadas de classe e subclasse, na ficha (`abilityUses`, por chave de armazenamento). Só o servidor grava: a rota do combate soma um uso
 * (numa transação, para dois cliques seguidos não passarem do limite) e o mestre renova no descanso. Os usos por combate ficam no combatente.
 */

/** Os usos do dia acabaram: a transação foi desfeita, nada foi gravado */
export class AbilityDayLimitReached extends Error {
    constructor(public readonly used: number) {
        super('Os usos do dia desta habilidade acabaram');
    }
}

/**
 * Soma um uso do dia à habilidade, se ainda houver. Lança `AbilityDayLimitReached` (sem gravar) quando os `max` usos já foram feitos. Devolve quantos usos o dia tem agora.
 */
export async function consumeAbilityDayUse(charsheetId: string, abilityKey: string, max: number): Promise<number> {
    const storage = abilityStorageKey(abilityKey);
    return await adminUpdateDocInTransaction<number, { abilityUses?: unknown }>('charsheets', charsheetId, data => {
        const used = readAbilityDayUses(data)[storage] ?? 0;
        if (used >= max) throw new AbilityDayLimitReached(used);
        return { fields: { [`abilityUses.${storage}`]: used + 1 }, result: used + 1 };
    });
}

/** Devolve um uso do dia (a ação falhou depois de o uso ser somado) */
export async function refundAbilityDayUse(charsheetId: string, abilityKey: string): Promise<void> {
    const storage = abilityStorageKey(abilityKey);
    await adminUpdateDocInTransaction<undefined, { abilityUses?: unknown }>('charsheets', charsheetId, data => {
        const used = readAbilityDayUses(data)[storage] ?? 0;
        return { fields: used > 0 ? { [`abilityUses.${storage}`]: used - 1 } : {}, result: undefined };
    });
}

/** O mestre renova os usos por dia (descanso): a ficha volta a não ter nenhum uso feito */
export async function resetAbilityDayUses(charsheetId: string): Promise<void> {
    await adminUpdateDoc('charsheets', charsheetId, { abilityUses: {} });
}
