/**
 * Rolagem de perícia de criatura pela regra única de d20 (`d20Rule.ts`): o atributo padrão da perícia dá o modificador (`⌊valor ÷ 5⌋`: 0 vale -1, 5 vale 1,
 * 10 vale 2... até 5) e os d20 são ele + 1 (vale o maior; modificador negativo rola 2 e vale o menor), e soma o valor da perícia. É a mesma conta do botão de perícia da criatura (`useCreatureExpertiseRoll`), sem mandar ao chat:
 * serve ao teste de defesa (Reflexos, RES) que o mestre rola pela criatura no painel do ataque.
 */
import { creatureD20Pool } from '../d20Rule';
import { completeCreatureExpertises } from './creatureExpertises';
import { adjustDice, keptDie, type EffectDice } from './effectDice';

interface CreatureRollSource {
    attributes?: object;
    expertises?: object;
}

export interface CreatureRoll {
    dice: number;
    rolls: number[];
    used: number;
    bonus: number;
    total: number;
    /** Qual d20 valeu: o maior (normal ou vantagem) ou o menor (a desvantagem dos efeitos passou das vantagens) */
    keep: 'highest' | 'lowest';
    /** De onde vêm as vantagens e desvantagens ("Cegueira: desvantagem, −1d20") */
    notes: string[];
}

const asNumber = (value: unknown): number => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

/** Quantos d20 o valor de atributo da criatura dá (regra única de d20, `d20Rule.ts`): o modificador dela + 1, ou 2 d20 que valem o menor quando o modificador é negativo */
export const creatureDiceFor = (attributeValue: number): number => creatureD20Pool(attributeValue).dice;

/** Rola a perícia da criatura; `null` se ela não tem a perícia (perícia padrão do Magitech sem bônus vale 0: toda criatura a tem) */
export function rollCreatureExpertise(
    creature: CreatureRollSource | null | undefined,
    name: string,
    random: () => number = Math.random,
    effects?: EffectDice
): CreatureRoll | null {
    if (!creature) return null;
    const expertise = completeCreatureExpertises<{ value?: unknown; defaultAttribute?: unknown }>(creature.expertises)[name];
    if (!expertise) return null;

    const attribute = typeof expertise.defaultAttribute === 'string' ? expertise.defaultAttribute : '';
    const pool = attribute ? creatureD20Pool(asNumber((creature?.attributes as Record<string, unknown> | undefined)?.[attribute])) : { dice: 1, keep: 'highest' as const };
    // Os efeitos aplicados à criatura (vantagem e desvantagem do teste) entram no saldo de d20, como no jogador
    const { dice, keep } = effects ? adjustDice(pool, effects) : pool;
    const rolls = Array.from({ length: dice }, () => Math.floor(random() * 20) + 1);
    const used = keptDie(rolls, keep);
    const bonus = asNumber(expertise.value);
    return { dice, rolls, used, bonus, total: used + bonus, keep, notes: effects?.notes ?? [] };
}
