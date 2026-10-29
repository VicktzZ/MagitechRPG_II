import type { Combatant, Creature } from '@models';
import { findBaseCreature } from '../combatCreatureLookup';
import { combatantVitals, type CombatantVitals } from '../combatantVitals';
import { getCreatureMpLimit, getMpLimit, isCreatureMpLimitEnforced, isMpLimitEnforced, type MpLimitSheet } from '../mpLimit';

/**
 * Regras puras do painel de combate do mestre: o que pede atenção dele (ataques esperando, saídas de alcance e ofertas de reação abertas) e o limite de MP por
 * turno de cada combatente. A tela só desenha o que sai daqui.
 */

interface CombatQueues {
    pendingAttacks?: readonly unknown[] | null;
    opportunities?: readonly unknown[] | null;
    reactions?: readonly unknown[] | null;
}

export interface CombatAttention {
    attacks: number;
    opportunities: number;
    reactions: number;
    total: number;
}

const sizeOf = (list: readonly unknown[] | null | undefined): number => (Array.isArray(list) ? list.length : 0);

/** Quantas coisas esperam o mestre no combate (um ataque por alvo conta um a um, como os cartões) */
export function combatAttention(combat: CombatQueues | null | undefined): CombatAttention {
    const attacks = sizeOf(combat?.pendingAttacks);
    const opportunities = sizeOf(combat?.opportunities);
    const reactions = sizeOf(combat?.reactions);
    return { attacks, opportunities, reactions, total: attacks + opportunities + reactions };
}

const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;

/** A frase do aviso do painel ("2 ataques esperando · 1 saída de alcance aberta"); vazia quando nada espera */
export function describeAttention(attention: CombatAttention): string {
    const parts = [
        attention.attacks > 0 ? `${plural(attention.attacks, 'ataque esperando', 'ataques esperando')} você` : '',
        attention.opportunities > 0 ? plural(attention.opportunities, 'saída de alcance aberta', 'saídas de alcance abertas') : '',
        attention.reactions > 0 ? plural(attention.reactions, 'oferta de reação aberta', 'ofertas de reação abertas') : ''
    ].filter(Boolean);
    return parts.join(' · ');
}

interface SheetStats { stats?: { lp?: number | null; maxLp?: number | null; mp?: number | null; maxMp?: number | null } | null }

interface VitalsContext {
    charsheets: ReadonlyArray<{ id: string } & SheetStats>;
    creatures: Creature[];
}

/**
 * Vida e mana que o painel mostra: do jogador, a ficha (o combatente guarda uma cópia que pode estar velha; sem a ficha vale a cópia); da criatura, a conta do combate
 * (`combatantVitals`: o que o combatente guarda e, no que falta, a criatura de origem).
 */
export function combatantVitalsView(combatant: Combatant, { charsheets, creatures }: VitalsContext): CombatantVitals {
    if (combatant.type !== 'player') return combatantVitals(combatant, findBaseCreature(combatant.id, creatures));

    const stats = charsheets.find(candidate => candidate.id === combatant.id || candidate.id === combatant.odacId)?.stats;
    return {
        lp: stats?.lp ?? combatant.currentLp ?? 0,
        maxLp: stats?.maxLp ?? combatant.maxLp ?? 0,
        mp: stats?.mp ?? combatant.currentMp ?? 0,
        maxMp: stats?.maxMp ?? combatant.maxMp ?? 0
    };
}

export interface MpLimitView {
    /** A regra vale para este combatente (jogador de ficha comum no Magitech padrão, criatura com Foco e nível) */
    enforced: boolean;
    limit: number;
    spent: number;
    /** O mestre liberou o limite até a rodada virar */
    released: boolean;
}

interface MpLimitContext {
    charsheets: ReadonlyArray<MpLimitSheet & { id: string }>;
    creatures: Creature[];
    mode?: string | null;
}

/** O limite de MP por turno do combatente: do jogador pela ficha (nível, Foco e ORM), da criatura pela criatura de origem (nível e Foco) */
export function mpLimitView(combatant: Combatant, { charsheets, creatures, mode }: MpLimitContext): MpLimitView {
    const sheet = combatant.type === 'player' ? charsheets.find(candidate => candidate.id === combatant.id || candidate.id === combatant.odacId) : undefined;
    const creature = combatant.type === 'creature' ? findBaseCreature(combatant.id, creatures) : undefined;

    const enforced = sheet ? isMpLimitEnforced(sheet, mode) : creature ? isCreatureMpLimitEnforced(creature, mode) : false;
    const limit = sheet ? getMpLimit(sheet) : creature ? getCreatureMpLimit(creature) : 0;

    return { enforced, limit, spent: combatant.mpSpentThisTurn ?? 0, released: Boolean(combatant.mpLimitOverride) };
}

/** Quem ainda não rolou a iniciativa (na fase de iniciativa) */
export const pendingInitiative = (combatants: ReadonlyArray<Pick<Combatant, 'initiativeRoll'>> | undefined): number => (combatants ?? []).filter(combatant => combatant.initiativeRoll === 0).length;
