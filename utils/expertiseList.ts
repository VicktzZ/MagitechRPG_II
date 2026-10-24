import { matchesSearch } from './searchText';

/** Ordem da lista de perícias: alfabética (padrão), ou pelo valor, do menor para o maior ou do maior para o menor */
export type ExpertiseSort = 'alpha-asc' | 'alpha-desc' | 'value-asc' | 'value-desc';

export const DEFAULT_EXPERTISE_SORT: ExpertiseSort = 'alpha-asc';

export const EXPERTISE_SORT_OPTIONS: ReadonlyArray<{ value: ExpertiseSort; label: string }> = [
    { value: 'alpha-asc', label: 'A → Z' },
    { value: 'alpha-desc', label: 'Z → A' },
    { value: 'value-desc', label: 'Maior valor' },
    { value: 'value-asc', label: 'Menor valor' }
];

export const isExpertiseSort = (value: unknown): value is ExpertiseSort => EXPERTISE_SORT_OPTIONS.some(option => option.value === value);

const compareNames = (a: string, b: string): number => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });

interface ExpertiseListOptions<T> {
    /** Busca por nome (sem acento nem caixa); vazia mostra todas */
    query?: string;
    sort?: ExpertiseSort;
    nameOf: (item: T) => string;
    valueOf: (item: T) => number;
}

/**
 * As perícias que passam na busca, na ordem pedida. A lista recebida não é alterada. Na ordem por valor o empate
 * desempata pelo nome, para a lista não embaralhar quando dois valores são iguais.
 */
export function filterAndSortExpertises<T>(items: readonly T[], { query = '', sort = DEFAULT_EXPERTISE_SORT, nameOf, valueOf }: ExpertiseListOptions<T>): T[] {
    const list = items.filter(item => matchesSearch(nameOf(item), query));
    const value = (item: T): number => Number(valueOf(item)) || 0;

    return list.sort((a, b) => {
        switch (sort) {
        case 'alpha-desc':
            return compareNames(nameOf(b), nameOf(a));
        case 'value-asc':
            return value(a) - value(b) || compareNames(nameOf(a), nameOf(b));
        case 'value-desc':
            return value(b) - value(a) || compareNames(nameOf(a), nameOf(b));
        default:
            return compareNames(nameOf(a), nameOf(b));
        }
    });
}
