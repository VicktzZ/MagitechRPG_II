import type { AppliedEffect, Combat } from '@models';
import { MAX_TEST_DICE } from '@utils/campaignTest';
import { normalizeSearchText } from '@utils/searchText';
import { advantagesFor, collectModifiers, disadvantagesFor } from './engine/modifiers';
import { isStealthEffect } from './stealth';

/**
 * Vantagem e desvantagem **dos efeitos aplicados** nas rolagens (catálogo `CombatEffect`: `advantage` e `disadvantage` com um alvo do teste). Cada efeito que mexe no
 * teste soma +1d20 (vantagem) ou tira 1d20 (desvantagem), pelo saldo líquido da regra do dono (`engine/dicePool.ts`): saldo ≥ 0 rola 1 + saldo e vale o maior, saldo < 0
 * rola 1 + |saldo| e vale o menor. Os alvos do catálogo são `attack` (o acerto da arma e o teste das magias de ataque), `dodge` (a esquiva, Reflexos), `perception`, `stealth` e
 * `initiative` (a rolagem de iniciativa, Fase 6.3).
 *
 * Fica de fora o efeito **Furtivo** no acerto: o dono já deu a ele +1d20 (e dano ×2) por regra própria (`stealth.ts`, #109), e contar também o `advantage:attack` do catálogo
 * dobraria a vantagem. O catálogo `seed-furtivo` segue só informativo, como já era.
 */

export type DiceScope = 'attack' | 'dodge' | 'perception' | 'stealth' | 'initiative';

export interface DiceBalance {
    advantages: number;
    disadvantages: number;
}

export interface EffectDice extends DiceBalance {
    /** De onde vem cada d20, para o chat e as telas dizerem: "Cegueira: desvantagem, −1d20" */
    notes: string[];
}

export const NO_EFFECT_DICE: EffectDice = { advantages: 0, disadvantages: 0, notes: [] };

const effectName = (effect: AppliedEffect): string => String(effect.snapshot?.name ?? 'Efeito').trim() || 'Efeito';

/** Vantagens e desvantagens que os efeitos aplicados dão a um tipo de teste, com a origem de cada uma */
export function effectDice(effects: readonly AppliedEffect[] | null | undefined, scope: DiceScope): EffectDice {
    const result: EffectDice = { advantages: 0, disadvantages: 0, notes: [] };

    for (const effect of effects ?? []) {
        if (scope === 'attack' && isStealthEffect(effect)) continue;

        const modifiers = collectModifiers([ effect ]);
        const advantages = advantagesFor(modifiers, scope);
        const disadvantages = disadvantagesFor(modifiers, scope);
        if (advantages > 0) {
            result.advantages += advantages;
            result.notes.push(`${effectName(effect)}: vantagem, +${advantages}d20`);
        }
        if (disadvantages > 0) {
            result.disadvantages += disadvantages;
            result.notes.push(`${effectName(effect)}: desvantagem, −${disadvantages}d20`);
        }
    }
    return result;
}

/** Os efeitos aplicados ao combatente, só com o combate ativo (fora dele os efeitos não existem) */
export function combatantEffects(combat: Pick<Combat, 'isActive' | 'combatants'> | null | undefined, combatantId: string | null | undefined): AppliedEffect[] {
    if (!combat?.isActive || !combatantId) return [];
    return combat.combatants?.find(combatant => combatant.id === combatantId)?.effects ?? [];
}

export interface DicePlan {
    dice: number;
    keep: 'highest' | 'lowest';
}

/**
 * Soma vantagens e desvantagens a um teste que já tem os d20 dele (o mod do atributo, ou os 2 da desvantagem de mod negativo): o saldo é o do teste mais as
 * vantagens menos as desvantagens, e dele saem a quantidade de d20 e qual vale. Sem nada a somar devolve o plano como veio.
 */
export function adjustDice(plan: DicePlan, balance: DiceBalance, max: number = MAX_TEST_DICE): DicePlan {
    if (balance.advantages <= 0 && balance.disadvantages <= 0) return plan;

    const base = Math.max(1, Math.floor(plan.dice));
    const score = (plan.keep === 'lowest' ? -(base - 1) : base - 1) + Math.max(0, balance.advantages) - Math.max(0, balance.disadvantages);
    return { dice: Math.min(1 + Math.abs(score), max), keep: score >= 0 ? 'highest' : 'lowest' };
}

/** O d20 que vale entre os rolados */
export const keptDie = (rolls: readonly number[], keep: DicePlan['keep']): number => (keep === 'lowest' ? Math.min(...rolls) : Math.max(...rolls));

/**
 * O alvo do efeito para as perícias que ele afeta: Percepção e Furtividade têm alvo próprio no catálogo. As outras perícias não: a esquiva (`dodge`) vale só na
 * defesa, e Reflexos fora dela é um teste comum
 */
export function expertiseScope(expertise: string | null | undefined): DiceScope | null {
    const name = normalizeSearchText(expertise);
    if (name === 'percepcao') return 'perception';
    if (name === 'furtividade') return 'stealth';
    return null;
}
