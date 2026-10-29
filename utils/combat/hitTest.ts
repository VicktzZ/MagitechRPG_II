import type { CharsheetDTO } from '@models/dtos';
import type { Attributes } from '@models/Attributes';
import type { Expertises } from '@models/Expertises';
import { d20Pool, SINGLE_D20 } from '../d20Rule';
import { DEFAULT_CRIT_MARGIN, isCriticalRoll } from './critical';
import { adjustDice, keptDie } from './effectDice';
import { sheetExpertisePenalty } from './sheetOverweight';

export interface HitTestResult {
    notation: string;
    rolls: number[];
    bestRoll: number;
    bonus: number;
    bonusLabel: string;
    total: number;
    /** Quantos d20 a mais foram pedidos por vantagem (Furtivo na arma e efeitos); 0 no teste comum */
    extraDice: number;
    /** Quantos d20 foram tirados por desvantagem (efeitos); 0 no teste comum */
    lessDice: number;
    /** Qual d20 vale: o maior (normal ou vantagem) ou o menor (a desvantagem líquida passou das vantagens) */
    keep: 'highest' | 'lowest';
    /** De onde vieram as vantagens e desvantagens, para o chat dizer ("furtivo: vantagem, +1d20", "Cegueira: desvantagem, −1d20") */
    notes: string[];
    /** O d20 natural que valeu passou da margem de crítico (`critMargin`): acerto crítico, marcado sozinho (ver `critical.ts`) */
    critical: boolean;
    /** A margem usada: 20 por padrão, a da arma e as reduções das passivas e dos efeitos */
    critMargin: number;
}

export interface RollHitOptions {
    /** d20 a mais no teste (vantagem) */
    extraDice?: number;
    /** d20 a menos no teste (desvantagem): vantagens e desvantagens se cancelam pelo saldo (`engine/dicePool.ts`) */
    lessDice?: number;
    /** A origem de cada vantagem e desvantagem, só para o texto */
    notes?: string[];
    /** Valor fixo somado ao teste (passivas e habilidades: Domínio Elemental +2, Ritmo da Batalha +2); a origem vai em `notes` */
    flatBonus?: number;
    /** A margem de crítico já calculada (`critMargin` de `critical.ts`); sem ela vale 20 (só o 20 natural) */
    critMargin?: number;
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
 * Rola um teste de acerto. O numero de d20s segue a regra unica (`d20Rule.ts`): mods.attributes[atributo] + 1, vale o maior (o menor se o modificador for negativo ou se as desvantagens passarem das vantagens), e soma o bonus da
 * pericia/atributo equivalente. E o teste do botao "Acerto" da arma e o teste de magia ao conjurar.
 */
export function rollHitTest(hitAttr: keyof Attributes | undefined, charsheet: CharsheetDTO, options: RollHitOptions = {}): HitTestResult {
    const pool = hitAttr ? d20Pool(charsheet.mods?.attributes?.[hitAttr]) : SINGLE_D20;
    const extraDice = Math.max(0, Math.floor(Number(options.extraDice) || 0));
    const lessDice = Math.max(0, Math.floor(Number(options.lessDice) || 0));
    // Os d20 do mod do atributo (mod + 1) são vantagens "de graça": o saldo com as vantagens e desvantagens dá a quantidade de dados e qual vale
    const { dice, keep } = adjustDice(pool, { advantages: extraDice, disadvantages: lessDice });

    const rolls: number[] = [];
    for (let i = 0; i < dice; i++) {
        rolls.push(Math.floor(Math.random() * 20) + 1);
    }

    const bestRoll = keptDie(rolls, keep);
    const { value: skillBonus, label: bonusLabel } = resolveHitBonus(hitAttr, charsheet);
    const flatBonus = Number.isFinite(Number(options.flatBonus)) ? Math.trunc(Number(options.flatBonus)) : 0;
    const bonus = skillBonus + flatBonus;
    const total = bestRoll + bonus;
    const margin = options.critMargin ?? DEFAULT_CRIT_MARGIN;

    return {
        notation: `${dice}d20${bonus >= 0 ? '+' : ''}${bonus}`,
        rolls,
        bestRoll,
        bonus,
        bonusLabel,
        total,
        extraDice,
        lessDice,
        keep,
        notes: options.notes ?? [],
        critical: isCriticalRoll(bestRoll, margin),
        critMargin: margin
    };
}

/** O teste de magia do jogador (Foco, com a pericia Magia), sempre o mesmo, seja qual for a magia */
export function rollSpellTest(charsheet: CharsheetDTO, options: RollHitOptions = {}): HitTestResult {
    return rollHitTest(SPELL_TEST_ATTRIBUTE, charsheet, options);
}
