import type { CharsheetDTO } from '@models/dtos';
import type { Attributes } from '@models/Attributes';
import type { Expertises } from '@models/Expertises';
import { sheetExpertisePenalty } from './sheetOverweight';

export interface HitTestResult {
    notation: string;
    rolls: number[];
    bestRoll: number;
    bonus: number;
    bonusLabel: string;
    total: number;
    /** Quantos d20 a mais foram rolados por vantagem (efeito Furtivo na arma); 0 no teste comum */
    extraDice: number;
}

export interface RollHitOptions {
    /** d20 a mais no teste (vantagem): vale o maior de todos */
    extraDice?: number;
}

export interface ResolvedHitBonus {
    value: number;
    label: string;
}

/** O atributo do teste de magia: sempre Foco, que cai na perícia Magia */
export const SPELL_TEST_ATTRIBUTE: keyof Attributes = 'foc';

const HIT_TO_EXPERTISE: Partial<Record<keyof Attributes, keyof Expertises>> = {
    'vig': 'Luta',
    'des': 'Pontaria',
    'foc': 'Magia'
};

const ATTRIBUTE_LABELS: Record<keyof Attributes, string> = {
    vig: 'VIG',
    des: 'DES',
    foc: 'FOC',
    log: 'LOG',
    sab: 'SAB',
    car: 'CAR'
};

/**
 * Qual bonus aplicar a um teste de acerto: prefere a pericia equivalente (Luta/Pontaria/Magia) se existir;
 * caso contrario usa o atributo direto.
 */
export function resolveHitBonus(hitAttr: keyof Attributes | undefined, charsheet: CharsheetDTO): ResolvedHitBonus {
    const expertiseKey = hitAttr ? HIT_TO_EXPERTISE[hitAttr] : undefined;

    if (expertiseKey && charsheet.expertises?.[expertiseKey]) {
        const expertise = charsheet.expertises[expertiseKey];
        const value = Number(expertise.value ?? 0);
        // Sobrepeso: −1 por kg excedido nas perícias de DES e VIG (Luta e Pontaria); o chat diz de onde vem o desconto
        const penalty = sheetExpertisePenalty(charsheet, expertise.defaultAttribute ?? hitAttr);
        return { value: value + penalty, label: penalty === 0 ? expertiseKey as string : `${expertiseKey as string}, sobrepeso ${penalty}` };
    }

    if (hitAttr && charsheet.attributes?.[hitAttr] !== undefined) {
        return {
            value: Number(charsheet.attributes[hitAttr] ?? 0),
            label: ATTRIBUTE_LABELS[hitAttr] ?? String(hitAttr).toUpperCase()
        };
    }

    return { value: 0, label: '—' };
}

/**
 * Rola um teste de acerto. O numero de d20s vem de mods.attributes[atributo] (>=1), vale o maior, e soma o bonus da
 * pericia/atributo equivalente. E o teste do botao "Acerto" da arma e o teste de magia ao conjurar.
 */
export function rollHitTest(hitAttr: keyof Attributes | undefined, charsheet: CharsheetDTO, options: RollHitOptions = {}): HitTestResult {
    let numDice = Number(hitAttr ? charsheet.mods?.attributes?.[hitAttr] : 1);
    if (!Number.isFinite(numDice) || numDice < 1) numDice = 1;
    const extraDice = Math.max(0, Math.floor(Number(options.extraDice) || 0));
    numDice += extraDice;

    const rolls: number[] = [];
    for (let i = 0; i < numDice; i++) {
        rolls.push(Math.floor(Math.random() * 20) + 1);
    }

    const bestRoll = rolls.length > 1 ? Math.max(...rolls) : rolls[0]!;
    const { value: bonus, label: bonusLabel } = resolveHitBonus(hitAttr, charsheet);
    const total = bestRoll + bonus;

    return {
        notation: `${numDice}d20${bonus >= 0 ? '+' : ''}${bonus}`,
        rolls,
        bestRoll,
        bonus,
        bonusLabel,
        total,
        extraDice
    };
}

/** O teste de magia do jogador (Foco, com a pericia Magia), sempre o mesmo, seja qual for a magia */
export function rollSpellTest(charsheet: CharsheetDTO): HitTestResult {
    return rollHitTest(SPELL_TEST_ATTRIBUTE, charsheet);
}
