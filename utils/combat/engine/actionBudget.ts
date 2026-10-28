/**
 * Ações de cada combatente por rodada (regras do dono): uma Padrão, uma Bônus (o antigo "Livre"), uma de Movimento e uma Reação.
 *  - Movimento: andar até o deslocamento em metros, conjurar magia de Movimento, pegar item da bolsa etc.
 *  - Completa gasta todas as ações, menos a Reação.
 *  - Quando a rodada vira e todos rolam iniciativa de novo, as ações de todos voltam (inclusive a Reação).
 * Habilidades podem dar ações extras (o ladino furtivo ganha mais): `freshBudget` aceita o extra.
 */

export type ActionSlot = 'padrao' | 'bonus' | 'movimento' | 'reacao';

export type ActionBudget = Record<ActionSlot, number>;

export const ACTION_SLOTS: readonly ActionSlot[] = [ 'padrao', 'bonus', 'movimento', 'reacao' ];

/** Ações de uma rodada nova; `extra` soma ações a mais (passivas de classe) */
export function freshBudget(extra: Partial<ActionBudget> = {}): ActionBudget {
    const add = (slot: ActionSlot): number => Math.max(0, Math.floor(Number(extra[slot]) || 0));
    return { padrao: 1 + add('padrao'), bonus: 1 + add('bonus'), movimento: 1 + add('movimento'), reacao: 1 + add('reacao') };
}

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** A execução do catálogo ("Padrão", "Livre", "Bônus", "Movimento", "Reação", "Completa") vira o espaço que ela gasta; `null` se não se reconhece */
export function executionSlot(execution: unknown): ActionSlot | 'completa' | null {
    switch (normalize(execution)) {
    case 'padrao': return 'padrao';
    case 'bonus':
    case 'livre': return 'bonus';
    case 'movimento': return 'movimento';
    case 'reacao': return 'reacao';
    case 'completa': return 'completa';
    default: return null;
    }
}

/** Espaços que a execução consome: a Completa gasta todos, menos a Reação */
const consumed = (slot: ActionSlot | 'completa'): ActionSlot[] => (slot === 'completa' ? [ 'padrao', 'bonus', 'movimento' ] : [ slot ]);

export interface SpendResult {
    ok: boolean;
    budget: ActionBudget;
    /** Os espaços que faltaram */
    missing: ActionSlot[];
}

/** Gasta a ação. Não muda o orçamento recebido; sem as ações necessárias devolve `ok: false` e o orçamento como estava */
export function spendAction(budget: ActionBudget, execution: unknown): SpendResult {
    const slot = executionSlot(execution);
    if (!slot) return { ok: false, budget, missing: [] };

    const needed = consumed(slot);
    const missing = needed.filter(entry => budget[entry] < 1);
    if (missing.length > 0) return { ok: false, budget, missing };

    const next = { ...budget };
    for (const entry of needed) next[entry] -= 1;
    return { ok: true, budget: next, missing: [] };
}

export const canSpend = (budget: ActionBudget, execution: unknown): boolean => spendAction(budget, execution).ok;
