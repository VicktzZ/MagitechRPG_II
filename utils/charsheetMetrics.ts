import type { Combat } from '@models';
import { getMpLimit, isMpLimitEnforced, type MpLimitSheet } from './mpLimit';

/** O que o mestre quer ver de relance de uma ficha, além dos pontos vitais */
export interface SheetMetrics {
    /** Overall da ficha: soma de atributos, valores de perícia e nível, como a ficha o guarda */
    overall: number;
    /** Máximo de MP gasto em magias por turno; `null` quando a regra não vale para esta ficha (Roguelite, sistema customizado, sem nível) */
    mpLimit: number | null;
    /** MP já gasto nesta rodada; só existe em combate ativo, para quem participa dele */
    mpSpent: number | null;
}

type MetricsSheet = MpLimitSheet & { id?: string; overall?: unknown };

const toInt = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.floor(parsed) : 0;
};

/** O combatente desta ficha no combate ativo (o combatente do jogador leva o id da ficha) */
export function findSheetCombatant(
    combat: Pick<Combat, 'isActive' | 'combatants'> | null | undefined,
    sheet: { id?: string }
): Combat['combatants'][number] | undefined {
    if (!combat?.isActive || !sheet.id) return undefined;
    return (Array.isArray(combat.combatants) ? combat.combatants : []).find(combatant => combatant.id === sheet.id);
}

export function getSheetMetrics(
    sheet: MetricsSheet,
    campaignMode?: string | null,
    combat?: Pick<Combat, 'isActive' | 'combatants'> | null
): SheetMetrics {
    const enforced = isMpLimitEnforced(sheet, campaignMode);
    const combatant = findSheetCombatant(combat, sheet);

    return {
        overall: Math.max(0, toInt(sheet.overall)),
        mpLimit: enforced ? getMpLimit(sheet) : null,
        mpSpent: enforced && combatant ? Math.max(0, toInt(combatant.mpSpentThisTurn)) : null
    };
}
