import { sameElement } from '../../elements';
import type { DamageKind } from './types';

/**
 * Defesa do alvo (regras do dono).
 *  - ACERTO: o total do ataque precisa ser ≥ o AP do alvo (AP é a "CA" do D&D; vale para criatura e objeto).
 *  - ESQUIVA: teste de Reflexos MAIOR que o total do atacante anula o dano por completo. Gasta a Reação. Não vale contra ataque mental, contra área
 *    maior que 3m nem contra quem ataca de surpresa.
 *  - RESISTÊNCIA: teste contra a DT = metade do total do atacante, arredondada para cima. Passando, o dano cai pelo AP do alvo + metade do mod da
 *    perícia (arredondada para baixo); no ataque mental cai pela metade. Falhando, vem inteiro.
 *  - Esquiva e resistência são alternativas: o alvo escolhe uma.
 */

export type ResistanceExpertise = 'RES Física' | 'RES Mágica' | 'RES Mental';

export const DODGE_EXPERTISE = 'Reflexos';
/** Área acima deste raio/tamanho não se esquiva */
export const DODGE_MAX_AREA_M = 3;

/** O ataque acertou o AP do alvo? */
export const hits = (attackTotal: number, targetAp: number): boolean => attackTotal >= targetAp;

/** DT do teste de resistência: metade do total do atacante, para cima (25 → 13) */
export const resistanceDT = (attackTotal: number): number => Math.ceil(attackTotal / 2);

/** O que o teste de Reflexos precisa tirar para esquivar: mais que o total do atacante (25 → 26) */
export const dodgeTarget = (attackTotal: number): number => Math.floor(attackTotal) + 1;

/** Ataque de elemento Psíquico é mental: usa a RES Mental, não se esquiva e o dano cai pela metade */
export function effectiveDamageKind(kind: DamageKind, element?: unknown): DamageKind {
    return kind === 'magico' && sameElement(element, 'Psíquico') ? 'mental' : kind;
}

export function resistanceExpertise(kind: DamageKind): ResistanceExpertise {
    if (kind === 'mental') return 'RES Mental';
    return kind === 'magico' ? 'RES Mágica' : 'RES Física';
}

export interface DodgeContext {
    kind: DamageKind;
    /** Tamanho da área do ataque em metros; vazio ou 0 é ataque de alvo único */
    areaMeters?: number | null;
    /** Quem ataca de surpresa (furtivo ou invisível, sem ser visto) não pode ser esquivado */
    surprised?: boolean;
    hasReaction?: boolean;
    /** O mestre ou um efeito (paralisia, atordoamento...) impede a esquiva */
    blocked?: boolean;
}

export type DodgeBlock = 'mental' | 'area' | 'surpresa' | 'sem-reacao' | 'impedida';

export interface DodgeEligibility {
    allowed: boolean;
    reason: DodgeBlock | null;
}

export function dodgeEligibility({ kind, areaMeters, surprised, hasReaction = true, blocked }: DodgeContext): DodgeEligibility {
    let reason: DodgeBlock | null = null;
    if (kind === 'mental') reason = 'mental';
    else if ((areaMeters ?? 0) > DODGE_MAX_AREA_M) reason = 'area';
    else if (surprised) reason = 'surpresa';
    else if (!hasReaction) reason = 'sem-reacao';
    else if (blocked) reason = 'impedida';
    return { allowed: reason === null, reason };
}

export const DODGE_BLOCK_TEXT: Record<DodgeBlock, string> = {
    mental: 'ataque mental não se esquiva',
    area: `área maior que ${DODGE_MAX_AREA_M}m não se esquiva`,
    surpresa: 'ataque de surpresa não se esquiva',
    'sem-reacao': 'sem Reação para esquivar',
    impedida: 'esquiva impedida'
};

export type DefenseChoice = 'none' | 'dodge' | 'resist';

export type DefenseStatus = 'none' | 'dodged' | 'dodge-failed' | 'resisted' | 'resist-failed';

export interface DefenseInput {
    choice: DefenseChoice;
    attackTotal: number;
    /** Total do teste do alvo (Reflexos na esquiva, RES na resistência) */
    defenseTotal?: number | null;
    eligibility: DodgeEligibility;
}

export interface DefenseResult {
    status: DefenseStatus;
    /** O que o teste precisava tirar; `null` sem teste */
    needed: number | null;
    rolled: number | null;
    /** Esquiva pedida mas impedida: vale como sem defesa */
    ignored: DodgeBlock | null;
    /** A Reação foi gasta (esquivar, com sucesso ou não) */
    spentReaction: boolean;
}

export function resolveDefense({ choice, attackTotal, defenseTotal = null, eligibility }: DefenseInput): DefenseResult {
    const none: DefenseResult = { status: 'none', needed: null, rolled: null, ignored: null, spentReaction: false };

    if (choice === 'dodge' && !eligibility.allowed) return { ...none, ignored: eligibility.reason };
    if (choice === 'none' || defenseTotal === null) return none;

    if (choice === 'dodge') {
        const needed = dodgeTarget(attackTotal);
        return { status: defenseTotal >= needed ? 'dodged' : 'dodge-failed', needed, rolled: defenseTotal, ignored: null, spentReaction: true };
    }

    const needed = resistanceDT(attackTotal);
    return { status: defenseTotal >= needed ? 'resisted' : 'resist-failed', needed, rolled: defenseTotal, ignored: null, spentReaction: false };
}

/** Quanto o AP e o mod da resistência tiram do dano de quem resistiu (ataque físico ou mágico): AP + ⌊mod ÷ 2⌋, nunca negativo */
export function resistReduction(targetAp: number, resistanceMod: number): number {
    return Math.max(0, Math.floor(targetAp) + Math.floor(resistanceMod / 2));
}
