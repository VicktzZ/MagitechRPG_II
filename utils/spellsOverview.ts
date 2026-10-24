import { matchesSearch, normalizeSearchText } from './searchText';

/** O pouco que as telas de lista precisam de uma magia */
export interface OverviewSpell {
    name?: string | null;
    element?: unknown;
    level?: unknown;
    mpCost?: unknown;
    type?: unknown;
}

export interface SpellFilters {
    query?: string;
    /** Elemento (qualquer caixa e acento); vazio = todos */
    element?: string;
    /** Nível 1 a 4; vazio ou 0 = todos */
    level?: number | string;
}

const levelOf = (spell: OverviewSpell): number => Number(spell.level) || 0;

/** Magias que passam nos filtros, na ordem recebida */
export function filterSpells<T extends OverviewSpell>(spells: readonly T[], filters: SpellFilters): T[] {
    const element = normalizeSearchText(filters.element);
    const level = Number(filters.level) || 0;

    return spells.filter(spell => {
        if (element && normalizeSearchText(spell.element) !== element) return false;
        if (level && levelOf(spell) !== level) return false;
        return matchesSearch([ spell.name, spell.element, spell.type ].map(part => (typeof part === 'string' ? part : '')).join(' '), filters.query ?? '');
    });
}

export interface ElementCount {
    element: string;
    count: number;
}

export interface SpellOverview {
    total: number;
    byLevel: Record<1 | 2 | 3 | 4, number>;
    /** Custo base médio de MP (sem o extra dos estágios), arredondado; `null` sem magias */
    averageMpCost: number | null;
    /** Elementos presentes, do mais frequente para o menos (empate em ordem alfabética) */
    elements: ElementCount[];
}

export function summarizeSpells(spells: readonly OverviewSpell[]): SpellOverview {
    const byLevel: SpellOverview['byLevel'] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const counts = new Map<string, ElementCount>();
    let mpTotal = 0;

    for (const spell of spells) {
        const level = levelOf(spell);
        if (level >= 1 && level <= 4) byLevel[level as 1 | 2 | 3 | 4] += 1;
        mpTotal += Number(spell.mpCost) || 0;

        const name = typeof spell.element === 'string' ? spell.element.trim() : '';
        if (!name) continue;
        const key = normalizeSearchText(name);
        const current = counts.get(key);
        if (current) current.count += 1;
        else counts.set(key, { element: name, count: 1 });
    }

    return {
        total: spells.length,
        byLevel,
        averageMpCost: spells.length ? Math.round(mpTotal / spells.length) : null,
        elements: [ ...counts.values() ].sort((a, b) => b.count - a.count || a.element.localeCompare(b.element, 'pt-BR'))
    };
}
