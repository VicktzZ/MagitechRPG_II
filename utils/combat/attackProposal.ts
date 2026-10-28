import type { AppliedEffect } from '@models';
import { creatureTakenModifiers, creatureWeaknessProfile } from './creatureDefense';
import { hits, resistanceExpertise, type DefenseChoice } from './engine/defense';
import { collectModifiers, modifiedStat } from './engine/modifiers';
import { resolveAttack, type AttackResolution } from './engine/attack';
import { dodgeEligibility, type DodgeEligibility } from './engine/defense';
import { weaknessAgainst, type WeaknessProfile } from './engine/weakness';
import { line, type DamageKind, type ExplainLine } from './engine/types';
import { totalWithExtraDice, type PendingAttackData } from './pendingAttacks';

/**
 * A proposta do motor para um ataque declarado: o mestre abre o ataque, escolhe a defesa do alvo (e pode trocar a natureza do ataque, dar a surpresa,
 * a área e o total da defesa) e vê o que aconteceu e por quê. **Só propõe**: o mestre ainda pode trocar o dano final antes de confirmar.
 * Pura: os dados da criatura, da ficha e dos efeitos vêm de quem chama (o navegador do mestre).
 */

/** Perícias por nome (`Expertises` da ficha e da criatura são classes sem index signature; lê-se como mapa) */
type ExpertiseMap = object

/** O que a proposta lê de uma criatura personalizada */
export interface TargetCreature {
    stats?: { ap?: unknown };
    expertises?: ExpertiseMap;
    elementalMastery?: unknown;
    weaknesses?: unknown;
    damageModifiers?: unknown;
}

/** O que a proposta lê de uma ficha */
export interface TargetSheet {
    stats?: { ap?: unknown };
    expertises?: ExpertiseMap;
    elementalMastery?: unknown;
}

export interface ProposalTarget {
    effects?: readonly AppliedEffect[] | null;
    /** A criatura personalizada de origem, se o alvo é criatura */
    creature?: TargetCreature | null;
    /** A ficha, se o alvo é jogador */
    sheet?: TargetSheet | null;
}

export interface ProposalChoice {
    /** Troca a natureza do ataque ("e se esse ataque fosse mental?") */
    kind?: DamageKind;
    defense: DefenseChoice;
    /** Total do teste do alvo (Reflexos na esquiva, RES na resistência) */
    defenseTotal?: number | null;
    /** O alvo não viu o atacante: sem esquiva */
    surprised?: boolean;
    /** Sobrescreve a área do ataque (em metros) */
    areaMeters?: number | null;
    /** d20 extras que o mestre rolou pelo ataque (vantagem da fraqueza do alvo) */
    extraRolls?: readonly number[];
    /** O alvo ainda tem a Reação (padrão: sim) */
    hasReaction?: boolean;
}

export interface AttackProposal {
    kind: DamageKind;
    /** O alvo é fraco ao ataque (+1d20 no acerto e dano ×2) */
    weak: boolean;
    /** Quantos d20 extras de vantagem o mestre ainda tem de rolar pelo ataque (0 ou 1) */
    extraDiceOwed: number;
    attackTotal: number;
    targetAp: number;
    hit: boolean;
    /** Perícia que o alvo testa para resistir a esse ataque */
    resistanceSkill: string;
    resistanceMod: number;
    dodge: DodgeEligibility;
    /** `null` enquanto o jogador não rolou o dano */
    resolution: AttackResolution | null;
    /** O dano que a proposta sugere (0 se errou ou ainda sem dano rolado) */
    finalDamage: number;
    /** Todas as linhas, inclusive as só do mestre; a mensagem do chat usa só as `all` */
    lines: ExplainLine[];
}

const asNumber = (value: unknown): number => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const expertiseValue = (target: ProposalTarget, name: string): number =>
    asNumber(((target.creature?.expertises ?? target.sheet?.expertises) as Record<string, { value?: unknown } | undefined> | undefined)?.[name]?.value);

export function buildAttackProposal(
    attack: PendingAttackData,
    attackerEffects: readonly AppliedEffect[] | null | undefined,
    target: ProposalTarget,
    choice: ProposalChoice
): AttackProposal {
    const kind = choice.kind ?? attack.kind;
    const profile: WeaknessProfile = target.creature
        ? creatureWeaknessProfile(target.creature)
        : { mastery: target.sheet?.elementalMastery };
    const weakness = weaknessAgainst(profile, attack.attackType);

    const extraRolls = choice.extraRolls ?? [];
    // O d20 extra da fraqueza só existe se o ataque tem d20 (ataque manual do mestre vale pelo total declarado)
    const rollsExtra = weakness.weak && attack.rolls.length > 0;
    const attackTotal = totalWithExtraDice(attack, rollsExtra ? extraRolls : []);
    const extraDiceOwed = rollsExtra && extraRolls.length < weakness.advantages ? weakness.advantages - extraRolls.length : 0;

    const targetModifiers = collectModifiers(target.effects);
    const baseAp = asNumber(target.creature?.stats?.ap ?? target.sheet?.stats?.ap);
    const targetAp = modifiedStat(targetModifiers, 'ap', baseAp);
    const taken = [ ...(target.creature ? creatureTakenModifiers(target.creature) : []), ...targetModifiers.taken ];
    const dealt = collectModifiers(attackerEffects).dealt;

    const resistanceSkill = resistanceExpertise(kind);
    const resistanceMod = expertiseValue(target, resistanceSkill);
    const areaMeters = choice.areaMeters ?? attack.areaMeters ?? null;
    const dodge = dodgeEligibility({ kind, areaMeters, surprised: choice.surprised, hasReaction: choice.hasReaction ?? true });
    const hit = hits(attackTotal, targetAp);

    const header: ExplainLine[] = [];
    if (rollsExtra) {
        header.push(line('Fraqueza do alvo ao ataque', `+${weakness.advantages}d20 no acerto e dano ×${weakness.damageMultiplier}`, 'gm'));
        if (extraRolls.length > 0) header.push(line('d20 extra', `[${extraRolls.join(', ')}]: total ${attackTotal}`));
    }

    if (attack.damageRolled === undefined) {
        return {
            kind, weak: weakness.weak, extraDiceOwed, attackTotal, targetAp, hit, resistanceSkill, resistanceMod, dodge,
            resolution: null,
            finalDamage: 0,
            lines: [ ...header, line('Acerto', `${attackTotal} contra AP ${targetAp}: ${hit ? 'acertou' : 'errou'}`) ]
        };
    }

    const resolution = resolveAttack({
        attackTotal,
        targetAp,
        kind,
        attackType: attack.attackType,
        areaMeters,
        surprised: choice.surprised,
        target: profile,
        defense: { choice: choice.defense, total: choice.defenseTotal ?? null, hasReaction: choice.hasReaction ?? true },
        resistanceMod,
        damageRolled: attack.damageRolled,
        dealt,
        taken
    });

    return {
        kind: resolution.kind, weak: weakness.weak, extraDiceOwed, attackTotal, targetAp, hit: resolution.hit, resistanceSkill, resistanceMod, dodge,
        resolution,
        finalDamage: resolution.damage,
        lines: [ ...header, ...resolution.lines ]
    };
}
