'use client';

import { DEFAULT_CREATURE_SORT, type CreatureSort } from '@utils/creatureList';
import { useCallback, useState } from 'react';

export interface CreatureListState {
    query: string;
    setQuery: (query: string) => void;
    /** Tipo filtrado (`NO_TYPE` para as sem tipo); `null` mostra todos */
    type: string | null;
    setType: (type: string | null) => void;
    sort: CreatureSort;
    setSort: (sort: CreatureSort) => void;
    /** Ids das criaturas com a ficha completa aberta no cartão */
    expanded: ReadonlySet<string>;
    toggle: (id: string) => void;
    expandAll: (ids: readonly string[]) => void;
    collapseAll: () => void;
    /** Limpa a busca e o filtro de tipo (a ordem e o que está aberto ficam) */
    clearFilters: () => void;
}

/** Busca, filtro de tipo, ordem e quais cartões estão abertos na lista de criaturas do mestre (só em memória: recarregar a página volta ao começo) */
export function useCreatureListState(): CreatureListState {
    const [ query, setQuery ] = useState('');
    const [ type, setType ] = useState<string | null>(null);
    const [ sort, setSort ] = useState<CreatureSort>(DEFAULT_CREATURE_SORT);
    const [ expanded, setExpanded ] = useState<ReadonlySet<string>>(new Set());

    const toggle = useCallback((id: string) => {
        setExpanded(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    return {
        query, setQuery, type, setType, sort, setSort, expanded, toggle,
        expandAll: useCallback((ids: readonly string[]) => { setExpanded(new Set(ids)); }, []),
        collapseAll: useCallback(() => { setExpanded(new Set()); }, []),
        clearFilters: useCallback(() => { setQuery(''); setType(null); }, [])
    };
}
