/**
 * Iniciativa de um combatente: quantos d20 rola e o bônus (perícia Agilidade). Era conta embutida na rota do combate;
 * mora aqui para a rolagem normal e a de quem entra no meio do combate usarem a mesma regra.
 */

import { sheetExpertisePenalty } from './sheetOverweight';

export interface InitiativeDice {
    numDice: number;
    /** Valor da perícia Agilidade, somado ao dado */
    expertiseValue: number;
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

export interface InitiativeResult {
    /** Dados rolados (vazio quando o mestre informou o resultado) */
    rolls: number[];
    /** Resultado do dado: o informado pelo mestre ou o maior dos rolados */
    roll: number;
    total: number;
}

const rollD20 = (): number => Math.floor(Math.random() * 20) + 1;

/** Rola a iniciativa; `manual` (> 0) é o resultado do dado dito pelo mestre e dispensa a rolagem */
export function resolveInitiative(dice: InitiativeDice, options: { manual?: number; d20?: () => number } = {}): InitiativeResult {
    const { manual, d20 = rollD20 } = options;
    if (typeof manual === 'number' && manual > 0) {
        return { rolls: [], roll: manual, total: manual + dice.expertiseValue };
    }
    const rolls = Array.from({ length: dice.numDice }, () => d20());
    const roll = rolls.length > 1 ? Math.max(...rolls) : rolls[0] ?? 1;
    return { rolls, roll, total: roll + dice.expertiseValue };
}

/** "[12, 7]: 12" com mais de um dado, "12" com um (o formato do log do combate) */
export function describeInitiativeRolls({ rolls, roll }: Pick<InitiativeResult, 'rolls' | 'roll'>): string {
    if (rolls.length === 0) return String(roll);
    return `[${rolls.join(', ')}]${rolls.length > 1 ? `: ${roll}` : ''}`;
}
