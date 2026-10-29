import type { Combatant } from '@models';
import { ACTION_SLOTS, freshBudget, type ActionBudget, type ActionSlot } from './engine/actionBudget';

/**
 * Orçamento de ações dos combatentes (regras do dono, ver `engine/actionBudget.ts`): cada um tem por rodada uma ação Padrão, uma Bônus,
 * uma de Movimento e uma Reação. Fica em `Combatant.actions`; combatente sem o campo (combate começado antes, ou que acabou de entrar)
 * tem tudo disponível. **Quando a rodada vira, as ações de todos voltam**, inclusive a Reação (`resetActionBudgets`), até o número de **ações por rodada** do combatente
 * (`Combatant.actionsPerRound`, 1 de cada se o mestre não mexeu: é como uma criatura ou um jogador com mais de uma ação Padrão, Bônus ou de Movimento por rodada).
 * O mestre pode ajustar qualquer ação à mão (devolver, dar extras só desta rodada ou em toda rodada): o jogador só gasta.
 */

export const MAX_ACTIONS_PER_SLOT = 9;

export const SLOT_LABEL: Record<ActionSlot, string> = { padrao: 'Padrão', bonus: 'Bônus', movimento: 'Movimento', reacao: 'Reação' };

/** A execução (como o catálogo e a rota escrevem) que gasta cada espaço */
export const SLOT_EXECUTION: Record<ActionSlot, string> = { padrao: 'Padrão', bonus: 'Bônus', movimento: 'Movimento', reacao: 'Reação' };

/** Lê o orçamento gravado; o que falta ou não vale cai no padrão (1 de cada) e os valores ficam entre 0 e 9 */
export function normalizeBudget(raw: unknown): ActionBudget {
    const base = freshBudget();
    if (!raw || typeof raw !== 'object') return base;

    const source = raw as Record<string, unknown>;
    const budget = { ...base };
    for (const slot of ACTION_SLOTS) {
        const value = Number(source[slot]);
        if (Number.isFinite(value)) budget[slot] = Math.min(MAX_ACTIONS_PER_SLOT, Math.max(0, Math.floor(value)));
    }
    return budget;
}

/** As ações que o combatente ainda tem agora */
export const combatantBudget = (combatant: { actions?: unknown } | null | undefined): ActionBudget => normalizeBudget(combatant?.actions);

/** Quantas ações de cada tipo o combatente recupera a cada rodada (1 de cada, salvo o que o mestre deu a mais: `Combatant.actionsPerRound`) */
export const combatantPerRound = (combatant: { actionsPerRound?: unknown } | null | undefined): ActionBudget => normalizeBudget(combatant?.actionsPerRound);

/** O combatente tem, por rodada, mais (ou menos) ações do que o padrão de 1 de cada */
export const hasCustomPerRound = (combatant: { actionsPerRound?: unknown } | null | undefined): boolean => {
    const perRound = combatantPerRound(combatant);
    return ACTION_SLOTS.some(slot => perRound[slot] !== 1);
};

/** Rodada nova: as ações de todos voltam, até o número por rodada de cada um */
export function resetActionBudgets(combatants: Combatant[] | undefined): void {
    for (const combatant of combatants ?? []) {
        combatant.actions = { ...combatantPerRound(combatant) };
    }
}

/**
 * O ajuste do mestre ({ padrao: 0, reacao: 1... }) aplicado ao orçamento atual; `null` se não traz nenhum espaço válido
 * (chave desconhecida, valor que não é inteiro de 0 a 9)
 */
export function applyBudgetPatch(current: ActionBudget, patch: unknown): ActionBudget | null {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return null;

    const entries = Object.entries(patch as Record<string, unknown>);
    if (entries.length === 0) return null;

    const next = { ...current };
    for (const [ key, value ] of entries) {
        if (!(ACTION_SLOTS as readonly string[]).includes(key)) return null;
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > MAX_ACTIONS_PER_SLOT) return null;
        next[key as ActionSlot] = value;
    }
    return next;
}

/**
 * A variação do mestre ({ padrao: 1, movimento: -1 }) somada ao orçamento atual, sempre entre 0 e 9: dar uma ação a mais soma, tirar uma subtrai. É por variação
 * (e não pelo valor final) para o jogador gastar uma ação ao mesmo tempo sem o ajuste desfazer o gasto. `null` se não traz nenhum espaço válido (chave desconhecida,
 * valor que não é inteiro de -9 a 9 ou zero em tudo).
 */
export function applyBudgetDelta(current: ActionBudget, delta: unknown): ActionBudget | null {
    if (!delta || typeof delta !== 'object' || Array.isArray(delta)) return null;

    const entries = Object.entries(delta as Record<string, unknown>);
    if (entries.length === 0) return null;

    const next = { ...current };
    let changed = false;
    for (const [ key, value ] of entries) {
        if (!(ACTION_SLOTS as readonly string[]).includes(key)) return null;
        if (typeof value !== 'number' || !Number.isInteger(value) || Math.abs(value) > MAX_ACTIONS_PER_SLOT) return null;
        if (value !== 0) changed = true;
        next[key as ActionSlot] = Math.min(MAX_ACTIONS_PER_SLOT, Math.max(0, current[key as ActionSlot] + value));
    }
    return changed ? next : null;
}

/** O que o diálogo "Dar ações" manda ao servidor: a variação das ações de agora e o novo número por rodada, só dos espaços que mudaram */
export interface ActionGrantPlan {
    delta: Partial<ActionBudget>;
    perRound: Partial<ActionBudget>;
}

/**
 * Compara o que o mestre escolheu no diálogo com o que o combatente tinha ao abrir e devolve só o que mudou. Subir (ou descer) o número por rodada leva junto as
 * ações de agora (a criatura que passa a ter 2 ações Padrão por rodada já tem 2 agora), e o mestre ainda acerta as de agora à parte; `null` se nada mudou.
 */
export function planActionGrant(before: { now: ActionBudget; perRound: ActionBudget }, after: { now: ActionBudget; perRound: ActionBudget }): ActionGrantPlan | null {
    const delta: Partial<ActionBudget> = {};
    const perRound: Partial<ActionBudget> = {};
    for (const slot of ACTION_SLOTS) {
        if (after.perRound[slot] !== before.perRound[slot]) perRound[slot] = after.perRound[slot];
        if (after.now[slot] !== before.now[slot]) delta[slot] = after.now[slot] - before.now[slot];
    }
    return Object.keys(delta).length === 0 && Object.keys(perRound).length === 0 ? null : { delta, perRound };
}

/** Os valores do diálogo depois de o mestre mexer no número por rodada de um espaço: as ações de agora acompanham a mesma variação (sempre entre 0 e 9) */
export function stepPerRound(state: { now: ActionBudget; perRound: ActionBudget }, slot: ActionSlot, step: number): { now: ActionBudget; perRound: ActionBudget } {
    const clamp = (value: number): number => Math.min(MAX_ACTIONS_PER_SLOT, Math.max(0, value));
    const perRound = clamp(state.perRound[slot] + step);
    const applied = perRound - state.perRound[slot];
    return {
        perRound: { ...state.perRound, [slot]: perRound },
        now: { ...state.now, [slot]: clamp(state.now[slot] + applied) }
    };
}

/** Os valores do diálogo depois de o mestre mexer nas ações de agora de um espaço (o número por rodada não muda) */
export function stepNow(state: { now: ActionBudget; perRound: ActionBudget }, slot: ActionSlot, step: number): { now: ActionBudget; perRound: ActionBudget } {
    return { perRound: state.perRound, now: { ...state.now, [slot]: Math.min(MAX_ACTIONS_PER_SLOT, Math.max(0, state.now[slot] + step)) } };
}

/** "Padrão 2, Movimento 3": só os espaços com mais (ou menos) de uma ação por rodada; vazio quando é o padrão de 1 de cada */
export const describePerRound = (perRound: ActionBudget): string =>
    ACTION_SLOTS.filter(slot => perRound[slot] !== 1).map(slot => `${SLOT_LABEL[slot]} ${perRound[slot]}`).join(', ');

/** "Padrão 1, Bônus 0, Movimento 1, Reação 1" */
export const describeBudget = (budget: ActionBudget): string => ACTION_SLOTS.map(slot => `${SLOT_LABEL[slot]} ${budget[slot]}`).join(', ');
