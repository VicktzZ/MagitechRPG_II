/**
 * Iniciativa de um combatente: quantos d20 rola e o bônus (perícia Agilidade). Era conta embutida na rota do combate;
 * mora aqui para a rolagem normal e a de quem entra no meio do combate usarem a mesma regra.
 */

import type { AppliedEffect } from '@models';
import { adjustDice, effectDice } from './effectDice';
import { initiativeEffectBonus } from './effectStats';
import { collectModifiers } from './engine/modifiers';
import { sheetExpertisePenalty } from './sheetOverweight';

export interface InitiativeDice {
    numDice: number;
    /** Valor da perícia Agilidade, somado ao dado */
    expertiseValue: number;
    /** Qual d20 vale entre os rolados (padrão: o maior; os efeitos podem trocar para o menor com desvantagem líquida) */
    keep?: 'highest' | 'lowest';
    /** Bônus (ou penalidade) fixo dos efeitos aplicados (Velocidade...), somado ao total além da perícia; 0 sem efeito */
    effectBonus?: number;
    /** De onde vêm o bônus e os d20 dos efeitos, para o log dizer ("Velocidade: +2") */
    effectNotes?: string[];
}

/** Os dados de iniciativa vêm de fichas e criaturas de formatos um pouco diferentes: lê só o que interessa */
interface AgilitySource {
    expertises?: { Agilidade?: { value?: unknown; defaultAttribute?: unknown } | null } | null;
    mods?: { attributes?: Record<string, unknown> | null } | null;
    attributes?: Record<string, unknown> | null;
}

const asSource = (value: unknown): AgilitySource | null => (value !== null && typeof value === 'object' ? value as AgilitySource : null);

const finiteOr = (value: unknown, fallback: number): number => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const agility = (source: AgilitySource): { expertiseValue: number; attributeKey: string } => {
    const expertise = source.expertises?.Agilidade;
    return {
        expertiseValue: Number(expertise?.value ?? 0) || 0,
        attributeKey: String(expertise?.defaultAttribute ?? 'des')
    };
};

const sanitize = (numDice: number, expertiseValue: number): InitiativeDice => ({
    numDice: Number.isFinite(numDice) && numDice >= 1 ? numDice : 1,
    expertiseValue: Number.isFinite(expertiseValue) ? expertiseValue : 0
});

/** Jogador: o número de d20 é o modificador do atributo padrão da Agilidade (mínimo 1) */
export function playerInitiativeDice(charsheet: unknown): InitiativeDice {
    const source = asSource(charsheet);
    if (!source) return sanitize(1, 0);
    const { expertiseValue, attributeKey } = agility(source);
    const mod = finiteOr(source.mods?.attributes?.[attributeKey] ?? 1, 1);
    // Agilidade é perícia de DES: o Sobrepeso (−1 por kg excedido) também tira da iniciativa
    return sanitize(mod < 1 ? 1 : mod, expertiseValue + sheetExpertisePenalty(charsheet, attributeKey));
}

/** Criatura: ⌊atributo ÷ 5⌋ d20 (mínimo 1, máximo 5; atributo 0 vale o mínimo) */
export function creatureInitiativeDice(creature: unknown): InitiativeDice {
    const source = asSource(creature);
    if (!source) return sanitize(1, 0);
    const { expertiseValue, attributeKey } = agility(source);
    const attribute = Number(source.attributes?.[attributeKey] ?? 0) || 0;
    const mod = attribute === 0 ? -1 : Math.min(5, Math.floor(attribute / 5));
    return sanitize(mod < 1 ? 1 : mod, expertiseValue);
}

/**
 * Soma à iniciativa o que os efeitos aplicados dão (Fase 6.3): vantagem e desvantagem em `initiative` mexem nos d20 pelo saldo líquido (`adjustDice`) e o bônus fixo
 * (`stat_bonus`/`stat_penalty` em `initiative`) soma ao total. Sem efeitos devolve os dados como vieram.
 */
export function initiativeWithEffects(
    dice: InitiativeDice,
    effects: readonly AppliedEffect[] | null | undefined,
    passives: { advantages: number; notes: string[] } = { advantages: 0, notes: [] }
): InitiativeDice {
    if ((!effects || effects.length === 0) && passives.advantages === 0) return dice;

    // As passivas de classe (Reflexos Aumentados: +1 dado) somam às vantagens dos efeitos, pelo mesmo saldo
    const fromEffects = effectDice(effects ?? [], 'initiative');
    const balance = { advantages: fromEffects.advantages + passives.advantages, disadvantages: fromEffects.disadvantages, notes: [ ...passives.notes, ...fromEffects.notes ] };
    const plan = adjustDice({ dice: dice.numDice, keep: dice.keep ?? 'highest' }, balance);
    const set = collectModifiers(effects);
    const bonus = initiativeEffectBonus(set);
    const bonusSources = (effects ?? []).filter(effect => collectModifiers([ effect ]).stats['initiative']).map(effect => String(effect.snapshot?.name ?? 'Efeito')).join(', ');
    const bonusNotes = bonus === 0 ? [] : [ `${bonus > 0 ? '+' : '−'}${Math.abs(bonus)} de ${bonusSources}` ];

    return {
        ...dice,
        numDice: plan.dice,
        keep: plan.keep,
        effectBonus: bonus,
        effectNotes: [ ...balance.notes, ...bonusNotes ]
    };
}

export interface InitiativeResult {
    /** Dados rolados (vazio quando o mestre informou o resultado) */
    rolls: number[];
    /** Resultado do dado: o informado pelo mestre ou o que vale entre os rolados */
    roll: number;
    total: number;
}

const rollD20 = (): number => Math.floor(Math.random() * 20) + 1;

/** Rola a iniciativa; `manual` (> 0) é o resultado do dado dito pelo mestre e dispensa a rolagem */
export function resolveInitiative(dice: InitiativeDice, options: { manual?: number; d20?: () => number } = {}): InitiativeResult {
    const { manual, d20 = rollD20 } = options;
    const bonus = dice.expertiseValue + (dice.effectBonus ?? 0);
    if (typeof manual === 'number' && manual > 0) {
        return { rolls: [], roll: manual, total: manual + bonus };
    }
    const rolls = Array.from({ length: dice.numDice }, () => d20());
    const roll = rolls.length > 1 ? (dice.keep === 'lowest' ? Math.min(...rolls) : Math.max(...rolls)) : rolls[0] ?? 1;
    return { rolls, roll, total: roll + bonus };
}

/** O que os efeitos deram à iniciativa, para o log: " [+2 de Velocidade]" ou " [Cegueira: desvantagem, −1d20]"; vazio sem efeito */
export const describeInitiativeEffects = (dice: InitiativeDice): string => (dice.effectNotes && dice.effectNotes.length > 0 ? ` [${dice.effectNotes.join('; ')}]` : '');

/** "[12, 7]: 12" com mais de um dado, "12" com um (o formato do log do combate) */
export function describeInitiativeRolls({ rolls, roll }: Pick<InitiativeResult, 'rolls' | 'roll'>): string {
    if (rolls.length === 0) return String(roll);
    return `[${rolls.join(', ')}]${rolls.length > 1 ? `: ${roll}` : ''}`;
}
