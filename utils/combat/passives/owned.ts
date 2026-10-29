import { normalizeSearchText } from '@utils/searchText';
import { normalizeToArray } from '@utils/normalizeToArray';
import { findPassive } from './catalog';
import type { PassiveCondition, PassiveDef, PassiveMode, PassiveSource } from './types';

/**
 * O que as passivas leem da ficha: classe e subclasse (as habilidades já liberadas), atributo Foco, perícia Luta, maestria elemental e LP. A ficha de verdade (`CharsheetDTO`)
 * tem tudo isso; o tipo é fino para o motor rodar também sobre o que o servidor lê do banco.
 */
export interface PassiveSheet {
    systemId?: string | null;
    skills?: { class?: unknown; subclass?: unknown } | null;
    attributes?: { foc?: unknown } | null;
    expertises?: { Luta?: { value?: unknown } | null } | null;
    elementalMastery?: unknown;
    stats?: { lp?: unknown; maxLp?: unknown } | null;
}

/** O momento da rolagem: a ficha e o que o combate sabe dela */
export interface PassiveContext {
    sheet: PassiveSheet | null | undefined;
    /** Está com o efeito Furtivo */
    stealthy?: boolean;
    /** O alvo escolhido ainda não agiu no combate (primeira rodada, depois dele na ordem) */
    targetNotActed?: boolean;
}

const finite = (value: unknown, fallback = 0): number => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

/** O nome da habilidade que o jogador tem na ficha, lido do objeto salvo (`Skill`) */
const skillNames = (list: unknown): string[] =>
    normalizeToArray<{ name?: unknown } | null>(list)
        .map(skill => (typeof skill?.name === 'string' ? skill.name : ''))
        .filter(Boolean);

/**
 * As passivas **estruturadas** que a ficha tem: as habilidades de classe e de subclasse que ela já liberou e que estão no catálogo. Ficha de sistema customizado não tem (as
 * habilidades dela têm outras regras); habilidade que não está no catálogo é só texto e não aparece aqui.
 */
export function ownedPassives(sheet: PassiveSheet | null | undefined): PassiveDef[] {
    if (!sheet || sheet.systemId) return [];

    const found = new Map<string, PassiveDef>();
    const lists: Array<[ PassiveSource, unknown ]> = [ [ 'class', sheet.skills?.class ], [ 'subclass', sheet.skills?.subclass ] ];
    for (const [ source, list ] of lists) {
        for (const name of skillNames(list)) {
            const def = findPassive(source, name);
            if (def) found.set(def.key, def);
        }
    }
    return [ ...found.values() ];
}

/** Como o app trata uma habilidade da ficha: automática, ativada ou só texto */
export const passiveModeOf = (source: PassiveSource, name: string): PassiveMode => findPassive(source, name)?.mode ?? 'texto';

/** O LP atual e o máximo da ficha (0 quando não há) */
export function sheetLp(sheet: PassiveSheet | null | undefined): { lp: number; maxLp: number } {
    return { lp: finite(sheet?.stats?.lp), maxLp: finite(sheet?.stats?.maxLp) };
}

/** A condição da regra vale agora? Sem condição vale sempre; LP em porcentagem precisa de LP máximo conhecido */
export function conditionMet(when: PassiveCondition | undefined, context: PassiveContext): boolean {
    if (!when) return true;
    const { lp, maxLp } = sheetLp(context.sheet);

    if (when.lpAtMostPct !== undefined && !(maxLp > 0 && (lp / maxLp) * 100 <= when.lpAtMostPct)) return false;
    if (when.lpBelowPct !== undefined && !(maxLp > 0 && (lp / maxLp) * 100 < when.lpBelowPct)) return false;
    if (when.lpAtMost !== undefined && !(lp <= when.lpAtMost)) return false;
    if (when.stealthy !== undefined && Boolean(context.stealthy) !== when.stealthy) return false;
    if (when.targetNotActed !== undefined && Boolean(context.targetNotActed) !== when.targetNotActed) return false;
    return true;
}

/** Valor do atributo Foco da ficha (0 sem ele) */
export const sheetFoc = (sheet: PassiveSheet | null | undefined): number => finite(sheet?.attributes?.foc);

/** Valor da perícia Luta da ficha (0 sem ela) */
export const sheetLuta = (sheet: PassiveSheet | null | undefined): number => finite(sheet?.expertises?.Luta?.value);

/** O elemento da maestria da ficha, sem acento nem caixa ("" sem maestria) */
export const sheetMastery = (sheet: PassiveSheet | null | undefined): string => normalizeSearchText(sheet?.elementalMastery);
