import type { Combatant } from '@models';
import { ACTION_SLOTS, freshBudget, type ActionBudget, type ActionSlot } from './engine/actionBudget';

/**
 * Orçamento de ações dos combatentes (regras do dono, ver `engine/actionBudget.ts`): cada um tem por rodada uma ação Padrão, uma Bônus,
 * uma de Movimento e uma Reação. Fica em `Combatant.actions`; combatente sem o campo (combate começado antes, ou que acabou de entrar)
 * tem tudo disponível. **Quando a rodada vira, as ações de todos voltam**, inclusive a Reação (`resetActionBudgets`).
 * O mestre pode ajustar qualquer ação à mão (devolver, dar extras): o jogador só gasta.
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

/** Rodada nova: as ações de todos voltam */
export function resetActionBudgets(combatants: Combatant[] | undefined): void {
    for (const combatant of combatants ?? []) {
        combatant.actions = freshBudget();
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

/** "Padrão 1, Bônus 0, Movimento 1, Reação 1" */
export const describeBudget = (budget: ActionBudget): string => ACTION_SLOTS.map(slot => `${SLOT_LABEL[slot]} ${budget[slot]}`).join(', ');
