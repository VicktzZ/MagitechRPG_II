import type { Combatant } from '@models';
import type { CreatureRoll } from './creatureRoll';
import type { DamageKind } from './engine/types';

/**
 * O ataque de um invocado, declarado pelo jogador que o controla: o app rola a perícia de ataque da criatura (Luta, Pontaria ou Magia, pela regra única de d20) e, se o jogador
 * escolheu um dado do invocado, o dano. Vira um ataque pendente como o do mestre ("Ataque manual", `source: 'manual'`) e o mestre resolve (AP, defesa do alvo, dano final). Puro: monta o
 * corpo da declaração e as frases; quem rola e fala com o servidor é o hook.
 */

export const SUMMON_ATTACK_SKILLS = [ 'Luta', 'Pontaria', 'Magia' ] as const;
export type SummonAttackSkill = typeof SUMMON_ATTACK_SKILLS[number];

export const isSummonAttackSkill = (value: unknown): value is SummonAttackSkill => SUMMON_ATTACK_SKILLS.some(skill => skill === value);

export interface SummonAttackChoice {
    targetId: string;
    skill: SummonAttackSkill;
    /** O dado do invocado que causa o dano (vazio: o jogador só testa o acerto e o mestre diz o dano) */
    diceId?: string;
    kind: DamageKind;
    /** Elemento ou tipo físico do dano ("Cortante", "Fogo") */
    attackType?: string;
}

/** Quem pode ser alvo: todos no combate, menos o próprio invocado */
export const attackTargetsFor = <T extends Pick<Combatant, 'id'>>(combatants: readonly T[] | undefined, summonId: string): T[] => (combatants ?? []).filter(combatant => combatant.id !== summonId);

export interface SummonAttackInput {
    summonId: string;
    choice: SummonAttackChoice;
    /** O nome do ataque no cartão do mestre: o do dado de dano, ou a perícia */
    attackName: string;
    roll: Pick<CreatureRoll, 'rolls' | 'bonus' | 'total' | 'keep'>;
    /** Dano rolado do dado escolhido; sem ele o ataque espera o dano */
    damage?: number;
}

/** O corpo de `declareAttack` do invocado (source `manual`: o mestre vê "Ataque manual" no cartão) */
export function buildSummonAttackBody(input: SummonAttackInput): { combatantId: string; targetId: string; attack: Record<string, unknown>; damage?: number } {
    const { summonId, choice, attackName, roll, damage } = input;
    return {
        combatantId: summonId,
        targetId: choice.targetId,
        attack: {
            source: 'manual',
            name: attackName,
            kind: choice.kind,
            ...(choice.attackType ? { attackType: choice.attackType } : {}),
            attackTotal: roll.total,
            rolls: roll.rolls,
            bonus: roll.bonus,
            ...(roll.keep === 'lowest' ? { keep: 'lowest' } : {})
        },
        ...(typeof damage === 'number' && Number.isInteger(damage) && damage >= 0 ? { damage } : {})
    };
}

/** A linha do acerto no chat: "🎯 Golem Arcano (invocado por Aria) testou acerto com Soco Rúnico (Luta): [14, 9: 14] +3 = **17**" */
export function buildSummonHitText(summonName: string, summonerName: string | undefined, attackName: string, skill: string, roll: Pick<CreatureRoll, 'rolls' | 'used' | 'bonus' | 'total' | 'keep'>): string {
    const owner = summonerName ? ` (invocado por ${summonerName})` : '';
    const rollPart = roll.rolls.length > 1 ? `${roll.rolls.join(', ')}: ${roll.used}` : `${roll.used}`;
    const sign = roll.bonus >= 0 ? '+' : '';
    const detail = roll.keep === 'lowest' ? `${skill}, vale o menor` : skill;
    return `🎯 ${summonName}${owner} testou acerto com **${attackName}** (${detail}): [${rollPart}] ${sign}${roll.bonus} = **${roll.total}**`;
}
