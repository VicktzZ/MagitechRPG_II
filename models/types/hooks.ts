import type { User } from 'realm-web';
import type { ApiParams } from './api';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Power } from '@models/entities';
import type { FilterValue } from '@utils/filterSelection';

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

export interface UseResourceListOptions<T> {
    initialSearch?: string;
    initialFilters?: string[];
    initialSecondaryFilters?: string[];
    initialSubFilters?: string[];
    initialSort?: {
        value: string;
        order: 'ASC' | 'DESC';
    };
    pageSize?: number;
    queryKey: string;
    fetchFunction: (params: ApiParams<string, T>) => Promise<T[]>;
    addFunction?: (item: T) => void;
    validateAdd?: (item: T, currentData: any) => { isValid: boolean; errorMessage?: string };
    successMessage?: (item: T) => string;
    errorMessage?: (error: Error) => string;
    /** Mapeia o rótulo de ordenação exibido para o campo real da entidade (ex: { Nível: 'level' }) */
    sortFieldMap?: Record<string, string>;
    /** Extrai o(s) valor(es) do segundo filtro (aplicado no cliente), ex: categoria(s) da magia */
    getSecondaryFilterValue?: (item: T) => FilterValue;
    /** Extrai o(s) valor(es) do subfiltro (aplicado no cliente, em conjunto com o segundo filtro), ex: subtipo(s) da magia */
    getSubFilterValue?: (item: T) => FilterValue;
}

export interface UseResourceListReturn<T> {
    search: string;
    filters: string[];
    secondaryFilters: string[];
    subFilters: string[];
    sort: {
        value: string;
        order: 'ASC' | 'DESC';
    };
    buttonSelected: {
        add: boolean;
        create: boolean;
        remove: boolean;
    };
    /** Itens exibidos: já com o segundo filtro e o subfiltro aplicados */
    items: T[];
    /** Itens carregados antes do segundo filtro/subfiltro — base para montar as opções deles */
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
    toggleSecondaryFilter: (value: string) => void;
    clearSecondaryFilters: () => void;
    toggleSubFilter: (value: string) => void;
    clearSubFilters: () => void;
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
