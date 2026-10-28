import { executionSlot } from './actionBudget';
import { MELEE_REACH_M, rangeKind, rangeMeters } from './rangeMeters';

/**
 * Ataque de oportunidade (regras do dono). Quem SAI do alcance corpo a corpo de um inimigo que já o viu provoca um ataque, feito ANTES de ele andar.
 *  - Alcance: 1,5m, ou o da arma na mão se for arma branca e o alcance dela for maior.
 *  - O ataque é obrigatoriamente corpo a corpo com a arma em mãos (ou desarmado, sem arma), ou uma magia de Reação de alcance Curto (3m):
 *    Toque, Visão e Pessoal não servem.
 *  - Não é obrigatório e gasta a Reação.
 *  - Desengajar (gasta uma ação Padrão) e tudo que tira o alvo instantaneamente do alcance (teleporte, habilidades, magias) anulam o ataque.
 * Movimento e distância são manuais (mapa de terceiros): é o mestre ou o jogador quem declara que alguém saiu do alcance; este módulo só diz se
 * isso provoca e com o que se pode atacar.
 */

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/**
 * O alcance do ataque corpo a corpo da arma na mão: 1,5m desarmado (sem arma), o maior entre 1,5m e o alcance da arma branca, ou `null` se a
 * arma não é branca (arma de fogo, de energia... não faz ataque de oportunidade)
 */
export function meleeReach(weapon?: { categ?: unknown; range?: unknown } | null): number | null {
    if (!weapon) return MELEE_REACH_M;
    if (!normalize(weapon.categ).startsWith('arma branca')) return null;
    return Math.max(MELEE_REACH_M, rangeMeters(weapon.range) ?? MELEE_REACH_M);
}

/** A magia serve de ataque de oportunidade: execução Reação e alcance Curto (ou corpo a corpo); Toque, Visão e Pessoal não */
export function isOpportunitySpell(spell: { execution?: unknown; range?: unknown }): boolean {
    return executionSlot(spell.execution) === 'reacao' && [ 'curto', 'corpo' ].includes(rangeKind(spell.range));
}

export type OpportunityBlock = 'sem-reacao' | 'incapacitado' | 'nao-viu' | 'desengajou' | 'saida-instantanea';

export interface OpportunityInput {
    reactor: {
        hasReaction: boolean;
        /** Paralisado, atordoado, derrubado... */
        incapacitated?: boolean;
        /** O mover já foi visto por este inimigo (matriz de percepção) */
        sawMover: boolean;
    };
    mover: {
        /** Usou Desengajar neste turno */
        disengaged?: boolean;
        /** Saiu do alcance instantaneamente (teleporte, magia, habilidade) */
        instantExit?: boolean;
    };
}

export interface OpportunityCheck {
    provoked: boolean;
    reason: OpportunityBlock | null;
}

/** Sair do alcance corpo a corpo provoca ataque de oportunidade deste inimigo? */
export function opportunityCheck({ reactor, mover }: OpportunityInput): OpportunityCheck {
    let reason: OpportunityBlock | null = null;
    if (mover.disengaged) reason = 'desengajou';
    else if (mover.instantExit) reason = 'saida-instantanea';
    else if (!reactor.sawMover) reason = 'nao-viu';
    else if (reactor.incapacitated) reason = 'incapacitado';
    else if (!reactor.hasReaction) reason = 'sem-reacao';
    return { provoked: reason === null, reason };
}
