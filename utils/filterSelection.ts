/** Valor de filtro de um item: um único valor, vários (ex: duas categorias) ou nenhum */
export type FilterValue = string | string[] | null | undefined;

/** Normaliza o valor de filtro de um item para uma lista de valores não vazios */
export function toFilterValues(value: FilterValue): string[] {
    if (value === null || value === undefined) return [];
    return (Array.isArray(value) ? value : [ value ]).filter(Boolean);
}

/**
 * Um item passa pelo filtro quando nada está selecionado ou quando pelo menos um dos
 * seus valores está entre os selecionados (OU dentro do mesmo filtro).
 */
export function matchesSelection(value: FilterValue, selected: string[]): boolean {
    if (selected.length === 0) return true;
    return toFilterValues(value).some(v => selected.includes(v));
}

export interface SelectionFilter<T> {
    /** Sem `getValue` o filtro não se aplica */
    getValue?: (item: T) => FilterValue;
    selected: string[];
}

/**
 * Aplica vários filtros de seleção. Entre filtros vale o E (o item precisa passar por todos
 * os que têm algo marcado); dentro de cada um, o OU. Um filtro sem nada marcado é ignorado,
 * então marcar só o subtipo filtra todas as magias que o tenham, de qualquer tipo.
 */
export function filterBySelections<T>(items: T[], filters: Array<SelectionFilter<T>>): T[] {
    const active: Array<{ getValue: (item: T) => FilterValue; selected: string[] }> = [];

    filters.forEach(({ getValue, selected }) => {
        if (getValue && selected.length > 0) active.push({ getValue, selected });
    });

    if (active.length === 0) return items;

    return items.filter(item => active.every(({ getValue, selected }) => matchesSelection(getValue(item), selected)));
}

/**
 * Opções de um filtro: as fixas (na ordem dada) seguidas das encontradas nos itens
 * que ainda não estejam entre elas (em ordem alfabética).
 */
export function collectFilterOptions<T>(
    items: T[],
    getValue: (item: T) => FilterValue,
    fixedOptions: string[] = []
): string[] {
    const known = new Set(fixedOptions);
    const found = new Set<string>();

    items.forEach(item => {
        toFilterValues(getValue(item)).forEach(value => {
            if (!known.has(value)) found.add(value);
        });
    });

    return [ ...fixedOptions, ...Array.from(found).sort((a, b) => a.localeCompare(b, 'pt-BR')) ];
}
