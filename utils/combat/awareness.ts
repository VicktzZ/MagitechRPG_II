import type { AppliedEffect } from '@models';
import { visionLevel, type VisionLevel } from './engine/lighting';
import { collectModifiers } from './engine/modifiers';
import { detectionDT, surprise } from './engine/perception';
import { hasStealthEffect, STEALTH_EXTRA_D20 } from './stealth';

/**
 * Percepção no combate assistido: **quem não vê quem** (a matriz de percepção). Todo mundo vê todo mundo, a menos que o mestre diga o contrário: cada par
 * "observador não vê o escondido" fica em `Combat.unseen`, com a **causa** (furtivo, invisível ou outra, como escuridão ou um obstáculo). O mapa é de terceiros,
 * então quem sabe quem enxerga quem é o mestre; o app só guarda isso e tira as consequências das regras do dono (`engine/perception.ts`):
 *  - **Desprevenido** é o alvo que não vê o atacante: ele não pode esquivar, e o atacante furtivo rola +1d20 no acerto (invisível, +2d20);
 *  - quem passa em Furtividade e é visto testa Percepção contra DT 20 (30 se invisível, 15 se invisível e o observador tem Visão Verdadeira); passando, o par
 *    sai da matriz. Visão Verdadeira anula a furtividade (vê sem teste);
 *  - quem não viu o alvo sair do alcance não provoca ataque de oportunidade.
 * É informação do mestre: só ele marca e revela, e a tela mostra aos jogadores apenas a quem se esconde que está fora da vista de alguém.
 */

export type HiddenCause = 'furtivo' | 'invisivel' | 'outro';

export const HIDDEN_CAUSES: readonly HiddenCause[] = [ 'furtivo', 'invisivel', 'outro' ];

export const HIDDEN_CAUSE_LABEL: Record<HiddenCause, string> = {
    furtivo: 'Furtivo',
    invisivel: 'Invisível',
    outro: 'Fora da vista (escuridão, obstáculo...)'
};

/** Um par da matriz: `observerId` não vê `hiderId` */
export interface UnseenData {
    id: string;
    hiderId: string;
    hiderName: string;
    observerId: string;
    observerName: string;
    cause: HiddenCause;
    createdAt: string;
}

export const MAX_UNSEEN = 60;
export const MAX_OBSERVERS = 30;

/** O que a matriz lê de um combatente */
interface AwarenessCombatant {
    id: string;
    name: string;
    effects?: readonly AppliedEffect[] | null;
}

/** A causa vinda do cliente (`null` se não for uma das conhecidas) */
export function sanitizeHiddenCause(raw: unknown): HiddenCause | null {
    return HIDDEN_CAUSES.find(cause => cause === raw) ?? null;
}

/** Quem não vê: ids de texto, sem repetir, no máximo 30 (o que vem do cliente) */
export function sanitizeObserverIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const ids = raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '' && entry.length <= 80);
    return [ ...new Set(ids) ].slice(0, MAX_OBSERVERS);
}

export interface HidePlan {
    /** Os pares a gravar (sem id nem horário, que a rota põe) */
    entries: Array<Pick<UnseenData, 'hiderId' | 'hiderName' | 'observerId' | 'observerName' | 'cause'>>;
    /** Avisos que não impedem a ação: ids que não estão no combate */
    warnings: string[];
}

/** Os pares para `hiderId` ficar fora da vista de `observerIds` (ele mesmo e quem saiu do combate ficam de fora) */
export function planHide(combatants: readonly AwarenessCombatant[], hiderId: string, observerIds: readonly string[], cause: HiddenCause): HidePlan {
    const hider = combatants.find(candidate => candidate.id === hiderId);
    const plan: HidePlan = { entries: [], warnings: [] };
    if (!hider) return plan;

    for (const observerId of observerIds) {
        const observer = combatants.find(candidate => candidate.id === observerId);
        if (!observer) {
            plan.warnings.push('Um dos combatentes escolhidos não está mais no combate.');
            continue;
        }
        if (observer.id === hider.id) continue;
        plan.entries.push({ hiderId: hider.id, hiderName: hider.name, observerId: observer.id, observerName: observer.name, cause });
    }
    return plan;
}

/** Grava os pares; o mesmo par (mesmo escondido e mesmo observador) troca o anterior, então mudar a causa é marcar de novo. Guarda os 60 mais novos */
export function addUnseen(list: readonly UnseenData[] | undefined, entries: readonly UnseenData[]): UnseenData[] {
    const kept = (list ?? []).filter(existing => !entries.some(entry => entry.hiderId === existing.hiderId && entry.observerId === existing.observerId));
    return [ ...kept, ...entries ].slice(-MAX_UNSEEN);
}

/** Tira os pares em que `hiderId` está escondido: de todos os observadores, ou só dos indicados */
export const revealUnseen = (list: readonly UnseenData[] | undefined, hiderId: string, observerIds?: readonly string[]): UnseenData[] =>
    (list ?? []).filter(entry => entry.hiderId !== hiderId || (observerIds !== undefined && !observerIds.includes(entry.observerId)));

/** Tira os pares de quem saiu do combate (escondido ou observador) */
export const dropUnseenFor = (list: readonly UnseenData[] | undefined, combatantId: string): UnseenData[] =>
    (list ?? []).filter(entry => entry.hiderId !== combatantId && entry.observerId !== combatantId);

/** O par "esse observador não vê esse escondido", se está na matriz */
export const unseenEntry = (list: readonly UnseenData[] | undefined, hiderId: string, observerId: string): UnseenData | undefined =>
    (list ?? []).find(entry => entry.hiderId === hiderId && entry.observerId === observerId);

/** Os pares em que o combatente está escondido (quem não o vê) */
export const hiddenFrom = (list: readonly UnseenData[] | undefined, hiderId: string | undefined): UnseenData[] =>
    (list ?? []).filter(entry => Boolean(hiderId) && entry.hiderId === hiderId);

export interface HiderGroup {
    hiderId: string;
    hiderName: string;
    entries: UnseenData[];
}

/** A matriz agrupada por quem está escondido, na ordem em que cada um apareceu */
export function groupByHider(list: readonly UnseenData[] | undefined): HiderGroup[] {
    const groups = new Map<string, HiderGroup>();
    for (const entry of list ?? []) {
        const group = groups.get(entry.hiderId) ?? { hiderId: entry.hiderId, hiderName: entry.hiderName, entries: [] };
        group.entries.push(entry);
        groups.set(entry.hiderId, group);
    }
    return [ ...groups.values() ];
}

/** A visão de um combatente pelos efeitos aplicados (Visão Aprimorada / Verdadeira); a criatura ainda não tem visão própria no cadastro */
export const combatantVision = (combatant: Pick<AwarenessCombatant, 'effects'>): VisionLevel => visionLevel(collectModifiers(combatant.effects));

/** O observador, com a visão que tem, de fato não enxerga o escondido? A Visão Verdadeira anula só a furtividade; invisibilidade e "fora da vista" ficam */
export function observerBlocked(cause: HiddenCause, observerVision: VisionLevel = 'normal'): boolean {
    return !(cause === 'furtivo' && observerVision === 'verdadeira');
}

/** O ataque pega o alvo desprevenido: ele não via o atacante */
export interface AttackSurprise {
    cause: HiddenCause;
    /** d20 a mais no acerto: 0, 1 (furtivo) ou 2 (invisível). "Fora da vista" não dá d20 (a regra do dono só cita furtivo e invisível) */
    advantages: number;
    /** O alvo não pode se esquivar */
    noDodge: true;
}

/** A surpresa do ataque de `attackerId` contra `target`, ou `null` se o alvo o via (ou a matriz não diz o contrário) */
export function attackSurprise(list: readonly UnseenData[] | undefined, attackerId: string, target: AwarenessCombatant | undefined): AttackSurprise | null {
    if (!target) return null;
    const entry = unseenEntry(list, attackerId, target.id);
    if (!entry) return null;

    const vision = combatantVision(target);
    if (!observerBlocked(entry.cause, vision)) return null;
    if (entry.cause === 'outro') return { cause: 'outro', advantages: 0, noDodge: true };

    const result = surprise({ furtive: entry.cause === 'furtivo', invisible: entry.cause === 'invisivel' }, { vision });
    return result.noDodge ? { cause: entry.cause, advantages: result.advantages, noDodge: true } : null;
}

/**
 * Os d20 da surpresa que o jogador **já rolou** no acerto: o efeito Furtivo (#109) dá +1d20 no acerto da arma (só da arma), então o mestre só rola
 * o que falta (o invisível, por exemplo, rola 2 e o efeito já deu 1)
 */
export function stealthDiceAlreadyRolled(source: 'weapon' | 'spell' | 'manual' | undefined, attackerEffects: readonly AppliedEffect[] | null | undefined): number {
    return source === 'weapon' && hasStealthEffect(attackerEffects) ? STEALTH_EXTRA_D20 : 0;
}

/** Quantos d20 de vantagem da surpresa o mestre ainda tem de rolar pelo ataque */
export const surpriseDiceOwed = (advantages: number, alreadyRolled: number): number => Math.max(0, Math.floor(advantages) - Math.max(0, Math.floor(alreadyRolled)));

/**
 * A DT do teste de Percepção do observador para notar o escondido, ou `null` quando não há o que testar: "fora da vista" não tem DT na regra (o mestre decide
 * se revela), e a Visão Verdadeira vê o furtivo sozinha
 */
export function perceptionDT(cause: HiddenCause, observerVision: VisionLevel = 'normal'): number | null {
    if (cause === 'outro') return null;
    return detectionDT({ furtive: cause === 'furtivo', invisible: cause === 'invisivel', observerVision });
}

/** A perícia que o observador testa para notar o escondido */
export const PERCEPTION_EXPERTISE = 'Percepção';
