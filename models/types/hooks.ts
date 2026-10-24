import type { User } from 'realm-web';
import type { ApiParams } from './api';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Power } from '@models/entities';
import type { ClientFilter } from '@utils/filterSelection';

export interface UseSkillsOptions {
    initialSearch?: string;
    initialFilter?: string;
    initialSort?: {
        value: string;
        order: 'ASC' | 'DESC';
    };
    pageSize?: number;
}

export interface UseSkills {
    search: string;
    filter: string;
    sort: {
        value: string;
        order: 'ASC' | 'DESC';
    };
    buttonSelected: {
        add: boolean;
        create: boolean;
        remove: boolean;
    };
    magicPowers: Power[];
    isLoading: boolean;
    isError: boolean;
    error: any;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    setSearch: (value: string) => void;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    setSort: React.Dispatch<React.SetStateAction<{ value: string; order: 'ASC' | 'DESC' }>>;
    setButtonSelected: React.Dispatch<React.SetStateAction<{ add: boolean; create: boolean; remove: boolean }>>;
    addPowerToCharsheet: (power: Power) => void;
    loadMore: () => void;
}

export interface UseResourceListParams {
    queryParams: {
        search: string;
        filter: string;
        sort: string;
        order: 'ASC' | 'DESC';
        page: number;
        limit: number;
    },
    params?: any,
    body?: any
}

/** Uma página da lista de recursos, como as rotas de busca a devolvem (o hook segue `nextCursor` enquanto `hasMore`) */
export interface ResourcePage<T> {
    data: T[];
    hasMore?: boolean;
    nextCursor?: string;
}

export interface UseResourceListOptions<T> {
    initialSearch?: string;
    initialFilters?: string[];
    /** Opções marcadas de início em cada filtro do cliente, por `ClientFilter.key` */
    initialClientSelections?: Record<string, string[]>;
    initialSort?: {
        value: string;
        order: 'ASC' | 'DESC';
    };
    pageSize?: number;
    queryKey: string;
    fetchFunction: (params: ApiParams<string, T>) => Promise<ResourcePage<T>>;
    addFunction?: (item: T) => void;
    validateAdd?: (item: T, currentData: any) => { isValid: boolean; errorMessage?: string };
    successMessage?: (item: T) => string;
    errorMessage?: (error: Error) => string;
    /** Mapeia o rótulo de ordenação exibido para o campo real da entidade (ex: { Nível: 'level' }) */
    sortFieldMap?: Record<string, string>;
    /**
     * Filtros resolvidos no cliente, depois da busca no servidor (ex: tipo, subtipo e execução da magia).
     * Combinam por E; dentro de cada um, vale o OU entre as opções marcadas.
     */
    clientFilters?: Array<ClientFilter<T>>;
    /**
     * Itens que a lista não pode mostrar de nenhuma maneira (nem na lista, nem na busca, nem nas opções dos
     * filtros, nem na contagem). Devolve `false` para esconder. Precisa ter identidade estável (`useCallback`).
     */
    itemFilter?: (item: T) => boolean;
}

export interface UseResourceListReturn<T> {
    search: string;
    filters: string[];
    /** Opções marcadas em cada filtro do cliente, por `ClientFilter.key` */
    clientSelections: Record<string, string[]>;
    sort: {
        value: string;
        order: 'ASC' | 'DESC';
    };
    buttonSelected: {
        add: boolean;
        create: boolean;
        remove: boolean;
    };
    /** Itens exibidos: já com os filtros do cliente aplicados */
    items: T[];
    /** Itens carregados antes dos filtros do cliente — base para montar as opções deles */
    loadedItems: T[];
    /** Há busca ou filtro ativo: o catálogo é carregado inteiro em vez de paginado por scroll */
    isFiltering: boolean;
    /** Modo filtrado ainda buscando as páginas restantes */
    isLoadingAll: boolean;
    isLoading: boolean;
    isError: boolean;
    error: any;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;

    setSearch: (value: string) => void;
    toggleFilter: (value: string) => void;
    clearFilters: () => void;
    toggleClientFilter: (key: string, value: string) => void;
    clearClientFilter: (key: string) => void;
    clearClientFilters: () => void;
    setSort: React.Dispatch<React.SetStateAction<{ value: string; order: 'ASC' | 'DESC' }>>;
    setButtonSelected: React.Dispatch<React.SetStateAction<{ add: boolean; create: boolean; remove: boolean }>>;
    addItem: (item: T) => void;
    loadMore: () => void;
}

export type UseRealtimeDatabaseOperationTypes = 'insert' | 'update' | 'delete' | 'replace';

export interface UseRealtimeDatabaseType<T> {
    data?: T;
    changedDocument?: T;
    updateDescription?: {
        updatedFields: Record<string, any>;
        removedFields: Record<string, any>;
    };
    operationType: UseRealtimeDatabaseOperationTypes;
    eventId: { id: string };
    documentId: string;
    credentials: User | null;
    query: UseQueryResult<T, Error>
}

export interface UseRealtimeDatabaseOnChange<T> {
    changedDocument?: T;
    updateDescription?: {
        updatedFields: Record<string, any>;
        removedFields: Record<string, any>;
    };
    operationType: UseRealtimeDatabaseOperationTypes;
    documentId: string;
}
