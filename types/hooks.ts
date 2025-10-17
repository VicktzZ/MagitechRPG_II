import type { User } from 'realm-web';
import type { ApiParams } from './api';
import type { MagicPower } from './ficha';
import type { UseQueryResult } from '@tanstack/react-query';

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
    magicPowers: MagicPower[];
    isLoading: boolean;
    isError: boolean;
    error: any;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    setSearch: (value: string) => void;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    setSort: React.Dispatch<React.SetStateAction<{ value: string; order: 'ASC' | 'DESC' }>>;
    setButtonSelected: React.Dispatch<React.SetStateAction<{ add: boolean; create: boolean; remove: boolean }>>;
    addPowerToFicha: (power: MagicPower) => void;
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
    initialFilter?: string;
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
}

export interface UseResourceListReturn<T> {
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
    items: T[];
    isLoading: boolean;
    isError: boolean;
    error: any;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    
    setSearch: (value: string) => void;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
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
    eventId: { _id: string };
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
