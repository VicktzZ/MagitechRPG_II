import {
    DODGE_BLOCK_TEXT,
    dodgeEligibility,
    effectiveDamageKind,
    hits,
    resistanceExpertise,
    resolveDefense,
    type DefenseChoice,
    type DefenseResult
} from './defense';
import { computeDamage } from './damage';
import { dicePool, type DicePool } from './dicePool';
import type { LightingResult } from './lighting';
import { advantagesFor, disadvantagesFor, type Amount, type ModifierSet, type TakenModifier } from './modifiers';
import type { Surprise } from './perception';
import { weaknessAgainst, type WeaknessProfile } from './weakness';
import { line, type DamageKind, type ExplainLine } from './types';

/**
 * Montagem de um ataque, em duas partes que o fluxo assistido chama em momentos diferentes:
 *  - `buildAttackDice`: quantos d20 o teste de acerto rola e qual vale, somando as fontes de vantagem e desvantagem;
 *  - `resolveAttack`: com os totais já rolados (acerto, defesa e dano), diz se acertou, o que o alvo fez e o dano final.
 * Tudo devolve as linhas do cálculo (`ExplainLine`) para o cartão de rolagem. O mestre confirma ou troca qualquer entrada.
 */

export interface AttackDiceInput {
    /** Dados base do teste (o mod do atributo + 1, regra única de d20) */
    baseDice?: number;
    /** Efeitos de quem ataca */
    attacker?: ModifierSet;
    /** O alvo e o elemento/tipo do ataque, para a fraqueza */
    target?: WeaknessProfile;
    attackType?: unknown;
    surprise?: Surprise;
    lighting?: LightingResult;
    /** Ajustes do mestre */
    extraAdvantages?: number;
    extraDisadvantages?: number;
}

export interface AttackDice {
    pool: DicePool;
    advantages: number;
    disadvantages: number;
    /** O alvo é fraco ao ataque (o dano dobra em `resolveAttack`) */
    weak: boolean;
    lines: ExplainLine[];
}

const dice = (count: number): string => `${count > 0 ? '+' : '−'}${Math.abs(count)}d20`;

export function buildAttackDice(input: AttackDiceInput): AttackDice {
    const lines: ExplainLine[] = [];
    let advantages = 0;
    let disadvantages = 0;

    const baseDice = Math.max(1, Math.floor(Number(input.baseDice) || 1));
    lines.push(line('Dados base', `${baseDice}d20`));

    const fromEffects = input.attacker ? advantagesFor(input.attacker, 'attack') : 0;
    if (fromEffects > 0) {
        advantages += fromEffects;
        lines.push(line('Vantagem dos efeitos', dice(fromEffects)));
    }
    const penaltyFromEffects = input.attacker ? disadvantagesFor(input.attacker, 'attack') : 0;
    if (penaltyFromEffects > 0) {
        disadvantages += penaltyFromEffects;
        lines.push(line('Desvantagem dos efeitos', dice(-penaltyFromEffects)));
    }

    if (input.surprise && input.surprise.advantages > 0) {
        advantages += input.surprise.advantages;
        lines.push(line('Ataque de surpresa', dice(input.surprise.advantages)));
    }

    const weakness = input.target ? weaknessAgainst(input.target, input.attackType) : null;
    if (weakness?.weak) {
        advantages += weakness.advantages;
        lines.push(line('Fraqueza do alvo ao ataque', dice(weakness.advantages), 'gm'));
    }

    if (input.lighting?.blinded) {
        disadvantages += 1;
        lines.push(line('Cegueira (escuridão)', dice(-1)));
    }
    if (input.lighting?.partialCover) {
        disadvantages += 1;
        lines.push(line('Cobertura parcial (luz)', dice(-1)));
    }

    const adjustAdvantages = Math.max(0, Math.floor(Number(input.extraAdvantages) || 0));
    if (adjustAdvantages > 0) {
        advantages += adjustAdvantages;
        lines.push(line('Ajuste do mestre', dice(adjustAdvantages)));
    }
    const adjustDisadvantages = Math.max(0, Math.floor(Number(input.extraDisadvantages) || 0));
    if (adjustDisadvantages > 0) {
        disadvantages += adjustDisadvantages;
        lines.push(line('Ajuste do mestre', dice(-adjustDisadvantages)));
    }

    const pool = dicePool({ baseDice, advantages, disadvantages });
    lines.push(line('Rolagem', `${pool.count}d20, vale o ${pool.keep === 'highest' ? 'maior' : 'menor'}`));
    return { pool, advantages, disadvantages, weak: Boolean(weakness?.weak), lines };
}

export interface ResolveAttackInput {
    /** Total do teste de acerto (ou de magia) do atacante */
    attackTotal: number;
    targetAp: number;
    /** Natureza do ataque; o mestre pode trocá-la. Magia de elemento Psíquico vira mental */
    kind: DamageKind;
    /** Elemento ou tipo físico do ataque ("Fogo", "Cortante") */
    attackType?: unknown;
    areaMeters?: number | null;
    /** O alvo não vê o atacante (`surprise`): sem esquiva */
    surprised?: boolean;
    target?: WeaknessProfile;
    defense: {
        choice: DefenseChoice;
        /** Total do teste do alvo: Reflexos (esquiva) ou RES (resistência) */
        total?: number | null;
        hasReaction?: boolean;
        blocked?: boolean;
    };
    /** Modificador da perícia de resistência que cabe ao ataque (RES Física ou RES Mágica) */
    resistanceMod?: number;
    /** Dano rolado, já com o crítico */
    damageRolled: number;
    dealt?: Amount;
    taken?: readonly TakenModifier[];
}

export interface AttackResolution {
    hit: boolean;
    /** A natureza considerada (psíquico → mental) */
    kind: DamageKind;
    defense: DefenseResult;
    damage: number;
    /** A Reação do alvo foi gasta na defesa (esquiva ou resistência) */
    targetSpentReaction: boolean;
    lines: ExplainLine[];
}

export function resolveAttack(input: ResolveAttackInput): AttackResolution {
    const kind = effectiveDamageKind(input.kind, input.attackType);
    const lines: ExplainLine[] = [];

    const hit = hits(input.attackTotal, input.targetAp);
    lines.push(line('Acerto', `${input.attackTotal} contra AP ${input.targetAp}: ${hit ? 'acertou' : 'errou'}`));
    if (!hit) {
        return { hit, kind, defense: resolveDefense({ choice: 'none', attackTotal: input.attackTotal, eligibility: { allowed: true, reason: null } }), damage: 0, targetSpentReaction: false, lines };
    }

    const eligibility = dodgeEligibility({
        kind,
        areaMeters: input.areaMeters,
        surprised: input.surprised,
        hasReaction: input.defense.hasReaction,
        blocked: input.defense.blocked
    });
    const defense = resolveDefense({ choice: input.defense.choice, attackTotal: input.attackTotal, defenseTotal: input.defense.total, eligibility });

    if (defense.ignored) lines.push(line('Esquiva negada', DODGE_BLOCK_TEXT[defense.ignored]));
    if (defense.status === 'dodged' || defense.status === 'dodge-failed') {
        lines.push(line('Esquiva', `Reflexos ${defense.rolled} contra ${defense.needed}: ${defense.status === 'dodged' ? 'esquivou' : 'falhou'}`));
    } else if (defense.status === 'resisted' || defense.status === 'resist-failed') {
        lines.push(line(resistanceExpertise(kind), `${defense.rolled} contra DT ${defense.needed}: ${defense.status === 'resisted' ? 'resistiu' : 'falhou'}`));
    }

    const weakness = input.target ? weaknessAgainst(input.target, input.attackType) : { weak: false, advantages: 0, damageMultiplier: 1 };
    const damage = computeDamage({
        rolled: input.damageRolled,
        kind,
        attackType: input.attackType,
        dealt: input.dealt,
        weaknessMultiplier: weakness.damageMultiplier,
        defense: defense.status,
        targetAp: input.targetAp,
        resistanceMod: input.resistanceMod ?? 0,
        taken: input.taken
    });

    return { hit, kind, defense, damage: damage.final, targetSpentReaction: defense.spentReaction, lines: [ ...lines, ...damage.steps ] };
}
