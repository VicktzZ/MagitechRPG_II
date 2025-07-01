import type { ReactElement } from 'react';
import type { ApiParams } from './api';

export interface ResourceListModalProps<T extends Record<string, any>> {
    open: boolean;
    onClose: () => void;
    queryKey: string;
    fetchFunction: (params: ApiParams<string, T>) => Promise<T[]>;
    addFunction: (item: T) => void;
    validateAdd: (item: T) => { isValid: boolean; errorMessage?: string };
    successMessage: (item: T) => string;
    errorMessage: (err: Error) => string;
    filterOptions: string[];
    sortOptions: string[];
    renderResource: ({ item, handleAddItem }: { item: T, handleAddItem?: () => void }) => ReactElement;
    pageSize?: number;
    title?: string;
    initialSearch?: string;
    initialFilter?: string;
    initialSort?: { value: string; order: 'ASC' | 'DESC' };
}