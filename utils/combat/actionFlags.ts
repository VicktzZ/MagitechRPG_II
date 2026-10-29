import type { AppliedEffect, Combat } from '@models';
import { combatantBudget } from './actionBudgets';
import { collectModifiers, hasFlag } from './engine/modifiers';
import type { ActionBudget } from './engine/actionBudget';
import { combatantEffects } from './effectDice';

/**
 * Flags de ação dos efeitos aplicados (Fase 6.2; catálogo `CombatEffect`): o que o efeito impede o combatente de fazer.
 *  - `skip_turn` (Atordoamento, Paralisia, Medo, Congelamento...): perde o turno. O catálogo às vezes diz "chance de pular o turno", então o app **avisa** e o mestre decide;
 *  - `no_actions` (Paralisia): sem ações na rodada;
 *  - `no_spells` (Silenciamento, Paralisia): não conjura magias;
 *  - `no_healing` (Necrose, Incurável): não recebe cura.
 * Cada flag guarda os **nomes dos efeitos** que a dão (a origem, como nas vantagens e desvantagens), para a tela e o chat dizerem de onde vem.
 * Tudo é assistido: o mestre remove o efeito para liberar, e o que a regra não consegue decidir sozinha fica como aviso.
 */

export type ActionFlag = 'skip_turn' | 'no_actions' | 'no_spells' | 'no_healing';

export const ACTION_FLAGS: readonly ActionFlag[] = [ 'skip_turn', 'no_actions', 'no_spells', 'no_healing' ];

/** Os nomes dos efeitos que dão cada flag; lista vazia = nada impede */
export type ActionBlocks = Record<ActionFlag, string[]>;

export const NO_ACTION_BLOCKS: ActionBlocks = { skip_turn: [], no_actions: [], no_spells: [], no_healing: [] };

const effectName = (effect: AppliedEffect): string => String(effect.snapshot?.name ?? 'Efeito').trim() || 'Efeito';

/** Quais flags de ação os efeitos aplicados dão, com o nome de cada efeito de origem (sem repetir) */
export function actionBlocks(effects: readonly AppliedEffect[] | null | undefined): ActionBlocks {
    const blocks: ActionBlocks = { skip_turn: [], no_actions: [], no_spells: [], no_healing: [] };

    for (const effect of effects ?? []) {
        const modifiers = collectModifiers([ effect ]);
        for (const flag of ACTION_FLAGS) {
            if (hasFlag(modifiers, flag) && !blocks[flag].includes(effectName(effect))) blocks[flag].push(effectName(effect));
        }
    }
    return blocks;
}

/** As flags de ação de um combatente no combate ativo (fora dele os efeitos não existem) */
export const combatantActionBlocks = (combat: Pick<Combat, 'isActive' | 'combatants'> | null | undefined, combatantId: string | null | undefined): ActionBlocks =>
    actionBlocks(combatantEffects(combat, combatantId));

export const isBlocked = (blocks: ActionBlocks, flag: ActionFlag): boolean => blocks[flag].length > 0;

/** "Paralisia" ou "Paralisia e Silenciamento": a origem dita em texto */
export function joinNames(names: readonly string[]): string {
    if (names.length <= 1) return names[0] ?? '';
    return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

const REASON: Record<ActionFlag, (who: string, by: string) => string> = {
    skip_turn: (who, by) => `${who} está com ${by}: o turno pode ser pulado`,
    no_actions: (who, by) => `${who} está com ${by} e não pode agir`,
    no_spells: (who, by) => `${who} está com ${by} e não pode conjurar magias`,
    no_healing: (who, by) => `${who} está com ${by}: a cura é bloqueada`
};

/** A frase de aviso de uma flag ("Aria está com Silenciamento e não pode conjurar magias"); vazio se nada impede */
export function blockReason(blocks: ActionBlocks, flag: ActionFlag, who: string): string {
    return isBlocked(blocks, flag) ? REASON[flag](who, joinNames(blocks[flag])) : '';
}

/**
 * As ações que o combatente tem **de fato** agora: sem nenhuma enquanto um efeito o impede de agir (`no_actions`, Paralisia), senão o orçamento guardado.
 * O orçamento guardado não muda (tirar o efeito devolve o que sobrava); o mestre ajusta o guardado em `set_actions`.
 */
export function effectiveBudget(combatant: { actions?: unknown; effects?: readonly AppliedEffect[] | null } | null | undefined): ActionBudget {
    if (isBlocked(actionBlocks(combatant?.effects), 'no_actions')) return { padrao: 0, bonus: 0, movimento: 0, reacao: 0 };
    return combatantBudget(combatant);
}
